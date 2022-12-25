package timeentry

import (
	"api/domain"
	userService "api/service/user"
	"api/utils"
	"errors"
	"time"

	"github.com/samber/lo"
	"gorm.io/gorm"
)

type TimeEntryService struct{}

var (
	ErrNoActiveTimer  = errors.New("no active timers available")
	ErrEndDateUtcNull = errors.New("end time is null")
)

func (*TimeEntryService) GetTimeEntry(timeEntryId int64, user *domain.UserModel) (*domain.TimeEntryModel, error) {
	db := utils.GetConnection()

	var timeEntry domain.TimeEntryModel
	tx := db.Where("Id = ? AND UserId = ? AND IsDeleted = false", timeEntryId, user.Id).First(&timeEntry)

	return &timeEntry, tx.Error
}

func (*TimeEntryService) GetEntries(month int, year int, user *domain.UserModel) ([]domain.TimeEntryModel, error) {
	db := utils.GetConnection()

	var timeEntries []domain.TimeEntryModel
	tx := db.
		Where("UserId = ? AND MONTH(StartTimeUtc) = ? AND YEAR(StartTimeUtc) = ? AND IsDeleted = false", user.Id, month, year).
		Find(&timeEntries)

	return timeEntries, tx.Error
}

func (s *TimeEntryService) SaveTimeEntry(id *int64, startTimeUtc time.Time, endTimeUtc time.Time, pauseSeconds int, note string, user *domain.UserModel) (int64, error) {
	db := utils.GetConnection()

	//update time entry
	if id != nil {
		updateModel, err := s.GetTimeEntry(*id, user)
		if err != nil {
			return 0, err
		}

		txErr := db.Transaction(func(tx *gorm.DB) error {
			updateModel.StartTimeUtc = startTimeUtc
			updateModel.EndTimeUtc = endTimeUtc
			updateModel.PauseSeconds = pauseSeconds
			updateModel.Note = note
			updateModel.OnUpdate()

			//update time entry
			if timeEntryTx := tx.Save(&updateModel); timeEntryTx.Error != nil {
				return timeEntryTx.Error
			}

			//insert log
			logModel := mapToTimeEntryLog(user.Id, updateModel, domain.UpdateLogType)

			if timeEntryLogTx := tx.Create(&logModel); timeEntryLogTx.Error != nil {
				return timeEntryLogTx.Error
			}

			return nil
		})

		return updateModel.Id, txErr
	}

	//insert logic
	insertModel := domain.TimeEntryModel{
		StartTimeUtc:   startTimeUtc,
		EndTimeUtc:     endTimeUtc,
		DailyWorkHours: user.DailyWorkHours,
		PauseSeconds:   pauseSeconds,
		Note:           note,
		IsDeleted:      false,
		UserId:         user.Id,
	}
	insertModel.OnInsert()

	txErr := db.Transaction(func(tx *gorm.DB) error {

		//insert time entry
		if timeEntryTx := tx.Create(&insertModel); timeEntryTx.Error != nil {
			return timeEntryTx.Error
		}

		logModel := mapToTimeEntryLog(user.Id, &insertModel, domain.InsertLogType)

		//insert log
		if timeEntryLogTx := tx.Create(&logModel); timeEntryLogTx.Error != nil {
			return timeEntryLogTx.Error
		}

		return nil
	})

	return insertModel.Id, txErr
}

func (s *TimeEntryService) DeleteTimeEntry(timeEntryId int64, user *domain.UserModel) error {
	db := utils.GetConnection()

	entry, err := s.GetTimeEntry(timeEntryId, user)
	if err != nil {
		return err
	}

	return db.Transaction(func(tx *gorm.DB) error {
		logModel := mapToTimeEntryLog(user.Id, entry, domain.DeleteLogType)

		//delete time entry
		if timeEntryTx := tx.Delete(&entry); timeEntryTx != nil {
			return timeEntryTx.Error
		}
		//insert log
		if timeEntryLogTx := tx.Create(&logModel); timeEntryLogTx != nil {
			return timeEntryLogTx.Error
		}

		return nil
	})
}

func (s *TimeEntryService) TimeEntryHistory(timeEntryId int64, user *domain.UserModel) (map[time.Time][]HistoryModel, error) {
	db := utils.GetConnection()

	timeEntry, err := s.GetTimeEntry(timeEntryId, user)
	if err != nil {
		return nil, err
	}

	var logs []domain.TimeEntryLogModel
	tx := db.Where("TimeEntryId = ?", timeEntryId).Find(&logs)
	if tx.Error != nil {
		return nil, tx.Error
	}

	userIds := lo.Uniq(lo.Map(logs, func(log domain.TimeEntryLogModel, _ int) int64 { return log.UserId }))

	userService := userService.UserService{}
	userMap, err := userService.GetUserMap(userIds)
	if err != nil {
		return nil, err
	}

	historyMap := map[time.Time][]HistoryModel{}

	for i, logEntry := range logs {
		logMessages := []HistoryModel{}

		modifiedByOwner := logEntry.UserId == timeEntry.UserId

		//load modifier user
		curUser := userMap[logEntry.UserId]

		//copy time objects
		start := logEntry.StartTimeUtc
		end := logEntry.EndTimeUtc

		switch domain.LogType(logEntry.LogTypeId) {
		case domain.InsertLogType:
			logMessages = append(logMessages, HistoryModel{
				Action:          EntryCreated,
				ModifiedByOwner: modifiedByOwner,
				ModifierName:    curUser.DisplayName,
				StartTimeUtc:    &start,
				EndTimeUtc:      &end,
			})
			break
		case domain.UpdateLogType:
			if len(logs)-1 >= 0 {
				prevLog := logs[i-1]
				if prevLog.StartTimeUtc != start || prevLog.EndTimeUtc != end {
					logMessages = append(logMessages, HistoryModel{
						Action:          TimeChange,
						ModifiedByOwner: modifiedByOwner,
						ModifierName:    curUser.DisplayName,
						StartTimeUtc:    &start,
						EndTimeUtc:      &end,
					})
				}

				if prevLog.PauseSeconds != logEntry.PauseSeconds {
					logMessages = append(logMessages, HistoryModel{
						Action:          PauseChange,
						ModifiedByOwner: modifiedByOwner,
						ModifierName:    curUser.DisplayName,
						PauseSeconds:    &logEntry.PauseSeconds,
					})
				}

			}

			break
		case domain.DeleteLogType:
			logMessages = append(logMessages, HistoryModel{
				Action:          EntryDeleted,
				ModifiedByOwner: modifiedByOwner,
				ModifierName:    curUser.DisplayName,
			})
			break
		}

		if len(logMessages) > 0 {
			inserted := logEntry.InsertedOnUtc
			inserted = inserted.Truncate(60 * time.Second)

			if messages, ok := historyMap[inserted]; ok {
				historyMap[inserted] = append(messages, logMessages...)
			} else {
				historyMap[inserted] = logMessages
			}
		}
	}
	return historyMap, nil
}

func mapToTimeEntryLog(userId int64, entry *domain.TimeEntryModel, logType domain.LogType) domain.TimeEntryLogModel {
	model := domain.TimeEntryLogModel{
		StartTimeUtc: entry.StartTimeUtc,
		EndTimeUtc:   entry.EndTimeUtc,
		PauseSeconds: entry.PauseSeconds,
		TimeEntryId:  entry.Id,
		UserId:       userId,
		LogTypeId:    int64(logType),
	}
	model.OnInsert()
	return model
}
