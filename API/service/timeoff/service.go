package timeoff

import (
	"api/domain"
	"api/utils"
	"time"

	"gorm.io/gorm"
)

type TimeOffService struct{}

func (*TimeOffService) GetTimeOffEntry(timeOffId int64, user *domain.UserModel) (*domain.TimeOffModel, error) {
	db := utils.GetConnection()

	var timeOffEntry domain.TimeOffModel
	tx := db.
		Where("Id = ? AND UserId = ?", timeOffId, user.Id).
		Preload("TimeOffType").
		First(&timeOffEntry)

	return &timeOffEntry, tx.Error
}

func (*TimeOffService) GetTimeOffEntries(user *domain.UserModel) ([]domain.TimeOffModel, error) {
	db := utils.GetConnection()

	var entries []domain.TimeOffModel
	tx := db.Where("UserId = ?", user.Id).
		Preload("TimeOffType").
		Find(&entries)

	return entries, tx.Error
}

func (*TimeOffService) GetStatusTypes() ([]domain.TimeOffTypeModel, error) {
	db := utils.GetConnection()

	var types []domain.TimeOffTypeModel
	tx := db.Find(&types)

	return types, tx.Error
}

func (s *TimeOffService) SaveTimeOffEntry(id *int64, startTimeUtc time.Time, endTimeUtc time.Time, note string, offTypeId int64, user *domain.UserModel) (int64, error) {
	db := utils.GetConnection()

	//update time entry
	if id != nil {
		updateModel, err := s.GetTimeOffEntry(*id, user)
		if err != nil {
			return 0, err
		}

		txErr := db.Transaction(func(tx *gorm.DB) error {
			updateModel.StartTimeUtc = startTimeUtc
			updateModel.EndTimeUtc = endTimeUtc
			updateModel.Note = note
			updateModel.TimeOffTypeId = offTypeId
			updateModel.OnUpdate()

			//update time off entry
			if entryTx := tx.Save(&updateModel); entryTx.Error != nil {
				return entryTx.Error
			}

			//insert log
			logModel := mapToTimeOffEntryLog(user.Id, updateModel, domain.UpdateLogType)

			if logTx := tx.Create(&logModel); logTx.Error != nil {
				return logTx.Error
			}

			return nil
		})

		return updateModel.Id, txErr
	}

	//insert logic
	insertModel := domain.TimeOffModel{
		StartTimeUtc:        startTimeUtc,
		EndTimeUtc:          endTimeUtc,
		Note:                note,
		TimeOffTypeId:       offTypeId,
		TimeOffStatusTypeId: int64(domain.PendingTimeOffStatus),
		UserId:              user.Id,
	}
	insertModel.OnInsert()

	txErr := db.Transaction(func(tx *gorm.DB) error {

		//insert time entry
		if entryTx := tx.Create(&insertModel); entryTx.Error != nil {
			return entryTx.Error
		}

		logModel := mapToTimeOffEntryLog(user.Id, &insertModel, domain.InsertLogType)

		//insert log
		if logTx := tx.Create(&logModel); logTx.Error != nil {
			return logTx.Error
		}

		return nil
	})

	return insertModel.Id, txErr
}

func (s *TimeOffService) SetTimeOffStatus(timeOffId int64, user *domain.UserModel, status domain.TimeOffStatus) error {
	db := utils.GetConnection()

	timeOffEntry, err := s.GetTimeOffEntry(timeOffId, user)
	if err != nil {
		return err
	}

	return db.Transaction(func(tx *gorm.DB) error {
		timeOffEntry.TimeOffStatusTypeId = int64(status)

		if tx := db.Save(timeOffEntry); tx.Error != nil {
			return tx.Error
		}

		logModel := mapToTimeOffEntryLog(user.Id, timeOffEntry, domain.UpdateLogType)

		if logTx := tx.Create(&logModel); logTx.Error != nil {
			return logTx.Error
		}

		return nil
	})
}

func mapToTimeOffEntryLog(userId int64, entry *domain.TimeOffModel, logType domain.LogType) domain.TimeOffLogModel {
	return domain.TimeOffLogModel{
		StartTimeUtc:        entry.StartTimeUtc,
		EndTimeUtc:          entry.EndTimeUtc,
		TimeOffTypeId:       entry.TimeOffTypeId,
		TimeOffStatusTypeId: entry.TimeOffStatusTypeId,
		TimeOffId:           entry.Id,
		UserId:              userId,
		LogTypeId:           int64(logType),
	}
}
