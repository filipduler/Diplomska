package timeentry

import (
	"api/domain"
	userService "api/service/user"
	"api/utils"
	"errors"
	"fmt"
	"time"

	"github.com/samber/lo"
	"gorm.io/gorm"
)

type TimeEntryService struct{}

var (
	ErrNoActiveTimer  = errors.New("no active timers available")
	ErrEndDateUtcNull = errors.New("end time is null")
)

func (*TimeEntryService) GetTimeEntry(timeEntryId int64, userId int64) (*domain.TimeEntryModel, error) {
	db := utils.GetConnection()

	var timeEntry domain.TimeEntryModel
	tx := db.Where("Id = ? AND UserId = ? AND IsDeleted = false", timeEntryId, userId).First(&timeEntry)

	return &timeEntry, tx.Error
}

func (*TimeEntryService) GetEntries(month int, year int, userId int64) ([]domain.TimeEntryModel, error) {
	db := utils.GetConnection()

	var timeEntries []domain.TimeEntryModel
	tx := db.
		Where("UserId = ? AND MONTH(StartTimeUtc) = ? AND YEAR(StartTimeUtc) = ? AND IsDeleted = false", userId, month, year).
		Find(&timeEntries)

	return timeEntries, tx.Error
}

func (*TimeEntryService) GetEntriesFrom(from time.Time, userId int64) ([]domain.TimeEntryModel, error) {
	db := utils.GetConnection()

	var timeEntries []domain.TimeEntryModel
	tx := db.
		Where("UserId = ? AND StartTimeUtc > ?", userId, from).
		Find(&timeEntries)

	return timeEntries, tx.Error
}

func (s *TimeEntryService) GetTimeEntryLogs(userId int64, from *time.Time, to *time.Time) ([]domain.TimeEntryLogModel, error) {
	db := utils.GetConnection()

	var dateQuery string
	var args []interface{}
	args = append(args, userId)

	if from != nil && to != nil {
		dateQuery = "AND InsertedOnUtc > ? AND InsertedOnUtc < ?"
		args = append(args, from, to)
	} else if from != nil {
		dateQuery = "AND InsertedOnUtc > ?"
		args = append(args, from)
	} else if to != nil {
		dateQuery = "AND InsertedOnUtc < ?"
		args = append(args, to)
	}

	var logs []domain.TimeEntryLogModel
	tx := db.Raw(fmt.Sprintf(`WITH last_log_entries AS (
			SELECT m.*, ROW_NUMBER() OVER (PARTITION BY TimeEntryId ORDER BY InsertedOnUtc DESC) AS rn
			FROM timeentrylog AS m
			WHERE m.UserId = ? %s
		)
		SELECT *
		FROM last_log_entries WHERE rn = 1`, dateQuery), args...).
		Find(&logs)

	return logs, tx.Error
}

func (s *TimeEntryService) SaveTimeEntry(id *int64, startTimeUtc time.Time, endTimeUtc time.Time, pauseSeconds int, note string, dailyWorkHours float32, userId int64) (int64, error) {
	db := utils.GetConnection()

	//update time entry
	if id != nil {
		updateModel, err := s.GetTimeEntry(*id, userId)
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
			if entryTx := tx.Save(&updateModel); entryTx.Error != nil {
				return entryTx.Error
			}

			//insert log
			logModel := mapToTimeEntryLog(userId, updateModel, domain.UpdateLogType)

			if logTx := tx.Create(&logModel); logTx.Error != nil {
				return logTx.Error
			}

			return nil
		})

		return updateModel.Id, txErr
	}

	//insert logic
	insertModel := domain.TimeEntryModel{
		StartTimeUtc:   startTimeUtc,
		EndTimeUtc:     endTimeUtc,
		DailyWorkHours: dailyWorkHours,
		PauseSeconds:   pauseSeconds,
		Note:           note,
		IsDeleted:      false,
		UserId:         userId,
	}
	insertModel.OnInsert()

	txErr := db.Transaction(func(tx *gorm.DB) error {

		//insert time entry
		if entryTx := tx.Create(&insertModel); entryTx.Error != nil {
			return entryTx.Error
		}

		logModel := mapToTimeEntryLog(userId, &insertModel, domain.InsertLogType)

		//insert log
		if logTx := tx.Create(&logModel); logTx.Error != nil {
			return logTx.Error
		}

		return nil
	})

	return insertModel.Id, txErr
}

func (s *TimeEntryService) DeleteTimeEntry(timeEntryId int64, userId int64) error {
	db := utils.GetConnection()

	entry, err := s.GetTimeEntry(timeEntryId, userId)
	if err != nil {
		return err
	}

	return db.Transaction(func(tx *gorm.DB) error {
		logModel := mapToTimeEntryLog(userId, entry, domain.DeleteLogType)

		//delete time entry
		if entryTx := tx.Delete(&entry); entryTx.Error != nil {
			return entryTx.Error
		}
		//insert log
		if logTx := tx.Create(&logModel); logTx.Error != nil {
			return logTx.Error
		}

		return nil
	})
}

func (s *TimeEntryService) TimeEntryHistory(timeEntryId int64, userId int64) (map[time.Time][]HistoryModel, error) {
	db := utils.GetConnection()

	timeEntry, err := s.GetTimeEntry(timeEntryId, userId)
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
			if len(logs)-1 >= 0 && i > 0 {
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
