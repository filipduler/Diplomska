package timeoff

import (
	"api/domain"
	"api/service"
	"api/utils"
	"time"

	"gorm.io/gorm"
)

type TimeOffService struct{}

func (*TimeOffService) GetTimeOffEntry(timeOffId int64, userId int64) (*domain.TimeOffModel, error) {
	db := utils.GetConnection()

	var timeOffEntry domain.TimeOffModel
	tx := db.
		Where("Id = ? AND UserId = ?", timeOffId, userId).
		Preload("TimeOffType").
		First(&timeOffEntry)

	return &timeOffEntry, tx.Error
}

func (*TimeOffService) GetTimeOffEntriesByUser(userId int64) ([]domain.TimeOffModel, error) {
	db := utils.GetConnection()

	var entries []domain.TimeOffModel
	tx := db.Where("UserId = ?", userId).
		Preload("TimeOffType").
		Find(&entries)

	return entries, tx.Error
}

func (*TimeOffService) GetTimeOffEntriesByStatus(status domain.TimeOffStatus) ([]domain.TimeOffModel, error) {
	db := utils.GetConnection()

	var entries []domain.TimeOffModel
	tx := db.Where("TimeOffStatusTypeId = ?", int64(status)).
		Preload("TimeOffType").
		Find(&entries)

	return entries, tx.Error
}

func (*TimeOffService) GetTimeOffEntriesBetween(from time.Time, to time.Time, userId int64, status domain.TimeOffStatus) ([]domain.TimeOffModel, error) {
	db := utils.GetConnection()

	var entries []domain.TimeOffModel
	tx := db.Where(`UserId = ? AND TimeOffStatusTypeId = ? AND 
		((StartDate BETWEEN ? AND ?) OR
		(EndDate BETWEEN ? AND ?))`, userId, int64(status), from, to, from, to).
		Preload("TimeOffType").
		Find(&entries)

	return entries, tx.Error
}

func (s *TimeOffService) GetTimeOffLogs(userId int64, from time.Time, to time.Time) ([]domain.TimeOffLogModel, error) {
	db := utils.GetConnection()

	var logs []domain.TimeOffLogModel
	tx := db.Raw(`WITH last_log_entries AS (
			SELECT timeofflog.*, ROW_NUMBER() OVER (PARTITION BY TimeOffId ORDER BY InsertedOnUtc DESC) AS rn
			FROM timeofflog
			INNER JOIN timeoff ON timeoff.Id = timeofflog.TimeOffId
			WHERE timeoff.UserId = ? AND timeofflog.InsertedOnUtc BETWEEN ? AND ?
		)
		SELECT *
		FROM last_log_entries WHERE rn = 1`, userId, from, to).
		Preload("TimeOffType").
		Preload("ModifierUser").
		Find(&logs)

	return logs, tx.Error
}

func (*TimeOffService) GetStatusTypes() ([]domain.TimeOffTypeModel, error) {
	db := utils.GetConnection()

	var types []domain.TimeOffTypeModel
	tx := db.Find(&types)

	return types, tx.Error
}

func (s *TimeOffService) SaveTimeOffEntry(id *int64,
	startDate time.Time,
	endDate time.Time,
	note string,
	offTypeId int64,
	userId int64,
	modifierUserId int64) (int64, error) {

	db := utils.GetConnection()

	//update time entry
	if id != nil {
		updateModel, err := s.GetTimeOffEntry(*id, userId)
		if err != nil {
			return 0, err
		}

		if updateModel.UserId != userId {
			return 0, service.ErrInvalidPermission
		}

		txErr := db.Transaction(func(tx *gorm.DB) error {
			updateModel.StartDate = startDate
			updateModel.EndDate = endDate
			updateModel.Note = note

			//we have to set TimeOffType to nil if not it doesnt save
			updateModel.TimeOffType = nil
			updateModel.TimeOffTypeId = offTypeId
			updateModel.OnUpdate()

			//update time off entry
			if entryTx := tx.Updates(updateModel); entryTx.Error != nil {
				return entryTx.Error
			}

			//insert log
			logModel := mapToTimeOffEntryLog(modifierUserId, updateModel, domain.UpdateLogType)

			if logTx := tx.Create(&logModel); logTx.Error != nil {
				return logTx.Error
			}

			return nil
		})

		return updateModel.Id, txErr
	}

	//insert logic
	insertModel := domain.TimeOffModel{
		StartDate:           startDate,
		EndDate:             endDate,
		Note:                note,
		TimeOffTypeId:       offTypeId,
		TimeOffStatusTypeId: int64(domain.PendingTimeOffStatus),
		UserId:              userId,
	}
	insertModel.OnInsert()

	txErr := db.Transaction(func(tx *gorm.DB) error {

		//insert time entry
		if entryTx := tx.Create(&insertModel); entryTx.Error != nil {
			return entryTx.Error
		}

		logModel := mapToTimeOffEntryLog(modifierUserId, &insertModel, domain.InsertLogType)

		//insert log
		if logTx := tx.Create(&logModel); logTx.Error != nil {
			return logTx.Error
		}

		return nil
	})

	return insertModel.Id, txErr
}

func (s *TimeOffService) SetTimeOffStatus(timeOffId int64, userId int64, modifierUserId int64, status domain.TimeOffStatus) error {
	db := utils.GetConnection()

	timeOffEntry, err := s.GetTimeOffEntry(timeOffId, userId)
	if err != nil {
		return err
	}

	return db.Transaction(func(tx *gorm.DB) error {
		timeOffEntry.TimeOffStatusTypeId = int64(status)

		if tx := db.Save(timeOffEntry); tx.Error != nil {
			return tx.Error
		}

		logModel := mapToTimeOffEntryLog(modifierUserId, timeOffEntry, domain.UpdateLogType)

		if logTx := tx.Create(&logModel); logTx.Error != nil {
			return logTx.Error
		}

		return nil
	})
}

func (s *TimeOffService) TimeOffHistory(timeOffId int64, userId int64) ([]HistoryModel, error) {
	db := utils.GetConnection()

	_, err := s.GetTimeOffEntry(timeOffId, userId)
	if err != nil {
		return nil, err
	}

	var logs []domain.TimeOffLogModel
	tx := db.
		Where("TimeOffId = ?", timeOffId).
		Preload("TimeOffType").
		Preload("ModifierUser").
		Find(&logs)
	if tx.Error != nil {
		return nil, tx.Error
	}

	historyChanges := []HistoryModel{}

	for i, logEntry := range logs {
		//copy time objects
		start := logEntry.StartDate
		end := logEntry.EndDate

		switch domain.LogType(logEntry.LogTypeId) {
		case domain.InsertLogType:
			//on insert
			historyChanges = append(historyChanges, HistoryModel{
				Action:         RequestOpen,
				ModifierUserId: logEntry.ModifierUserId,
				ModifierName:   logEntry.ModifierUser.DisplayName,
				StartDate:      &start,
				EndDate:        &end,
				Type:           &logEntry.TimeOffType.Name,
				InsertedOnUtc:  logEntry.InsertedOnUtc,
			})
			break
		case domain.UpdateLogType:
			if len(logs)-1 >= 0 && i > 0 {
				prevLog := logs[i-1]

				//time change
				if prevLog.StartDate != start || prevLog.EndDate != end {
					historyChanges = append(historyChanges, HistoryModel{
						Action:         TimeChange,
						ModifierUserId: logEntry.ModifierUserId,
						ModifierName:   logEntry.ModifierUser.DisplayName,
						StartDate:      &start,
						EndDate:        &end,
						InsertedOnUtc:  logEntry.InsertedOnUtc,
					})
				}

				//type change
				if prevLog.TimeOffTypeId != logEntry.TimeOffTypeId {
					historyChanges = append(historyChanges, HistoryModel{
						Action:         TypeChange,
						ModifierUserId: logEntry.ModifierUserId,
						ModifierName:   logEntry.ModifierUser.DisplayName,
						Type:           &logEntry.TimeOffType.Name,
						InsertedOnUtc:  logEntry.InsertedOnUtc,
					})
				}

				//status change
				if prevLog.TimeOffStatusTypeId != logEntry.TimeOffStatusTypeId &&
					(logEntry.TimeOffStatusTypeId == int64(domain.AcceptedTimeOffStatus) ||
						logEntry.TimeOffStatusTypeId == int64(domain.RejectedTimeOffStatus) ||
						logEntry.TimeOffStatusTypeId == int64(domain.CanceledTimeOffStatus)) {
					status := logEntry.TimeOffStatusTypeId
					historyChanges = append(historyChanges, HistoryModel{
						Action:         RequestClosed,
						ModifierUserId: logEntry.ModifierUserId,
						ModifierName:   logEntry.ModifierUser.DisplayName,
						Status:         &status,
						InsertedOnUtc:  logEntry.InsertedOnUtc,
					})
				}
			}

			break
		}
	}
	return historyChanges, nil
}

func mapToTimeOffEntryLog(modifierUserId int64, entry *domain.TimeOffModel, logType domain.LogType) domain.TimeOffLogModel {
	model := domain.TimeOffLogModel{
		StartDate:           entry.StartDate,
		EndDate:             entry.EndDate,
		TimeOffTypeId:       entry.TimeOffTypeId,
		TimeOffStatusTypeId: entry.TimeOffStatusTypeId,
		TimeOffId:           entry.Id,
		ModifierUserId:      modifierUserId,
		LogTypeId:           int64(logType),
	}
	model.OnInsert()
	return model
}
