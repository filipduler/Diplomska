package timeentry

import (
	"api/domain"
	"api/utils"
	"errors"
	"time"

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
	tx := db.Where("Id = ? AND UserId = ?", timeEntryId, userId).First(&timeEntry)

	return &timeEntry, tx.Error
}

func (*TimeEntryService) GetValidTimeEntry(timeEntryId int64, userId int64) (*domain.TimeEntryModel, error) {
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
		Where("IsDeleted = false AND UserId = ? AND StartTimeUtc > ?", userId, from).
		Find(&timeEntries)

	return timeEntries, tx.Error
}

func (*TimeEntryService) GetEntriesBetween(from time.Time, to time.Time, userId int64) ([]domain.TimeEntryModel, error) {
	db := utils.GetConnection()

	var entries []domain.TimeEntryModel
	tx := db.Where(`IsDeleted = false AND UserId = ? AND StartTimeUtc BETWEEN ? AND ?`, userId, from, to).
		Find(&entries)

	return entries, tx.Error
}

func (s *TimeEntryService) GetTimeEntryLogs(userId int64, from time.Time, to time.Time) ([]domain.TimeEntryLogModel, error) {
	db := utils.GetConnection()

	var logs []domain.TimeEntryLogModel
	tx := db.Raw(`WITH last_log_entries AS (
			SELECT timeentrylog.*, ROW_NUMBER() OVER (PARTITION BY TimeEntryId ORDER BY InsertedOnUtc DESC) AS rn
			FROM timeentrylog
			INNER JOIN timeentry ON timeentry.Id = timeentrylog.TimeEntryId
			WHERE timeentry.UserId = ? AND timeentrylog.InsertedOnUtc BETWEEN ? AND ?
		)
		SELECT *
		FROM last_log_entries WHERE rn = 1`, userId, from, to).
		Preload("ModifierUser").
		Find(&logs)

	return logs, tx.Error
}

func (s *TimeEntryService) SaveTimeEntry(id *int64,
	startTimeUtc time.Time,
	endTimeUtc time.Time,
	pauseSeconds int,
	note string,
	dailyWorkHours float64,
	userId int64,
	modifierUserId int64) (int64, error) {
	db := utils.GetConnection()

	//update time entry
	if id != nil {
		updateModel, err := s.GetValidTimeEntry(*id, userId)
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
			logModel := mapToTimeEntryLog(modifierUserId, updateModel, domain.UpdateLogType)

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

		logModel := mapToTimeEntryLog(modifierUserId, &insertModel, domain.InsertLogType)

		//insert log
		if logTx := tx.Create(&logModel); logTx.Error != nil {
			return logTx.Error
		}

		return nil
	})

	return insertModel.Id, txErr
}

func (s *TimeEntryService) DeleteTimeEntry(timeEntryId int64, userId int64, modifierUserId int64) error {
	db := utils.GetConnection()

	entry, err := s.GetValidTimeEntry(timeEntryId, userId)
	if err != nil {
		return err
	}

	return db.Transaction(func(tx *gorm.DB) error {
		logModel := mapToTimeEntryLog(modifierUserId, entry, domain.DeleteLogType)

		//delete time entry
		entry.IsDeleted = true
		if entryTx := tx.Save(&entry); entryTx.Error != nil {
			return entryTx.Error
		}
		//insert log
		if logTx := tx.Create(&logModel); logTx.Error != nil {
			return logTx.Error
		}

		return nil
	})
}

func (s *TimeEntryService) TimeEntryHistory(timeEntryId int64, userId int64) ([]HistoryModel, error) {
	db := utils.GetConnection()

	//we dont need a valid time entry for history
	_, err := s.GetTimeEntry(timeEntryId, userId)
	if err != nil {
		return nil, err
	}

	var logs []domain.TimeEntryLogModel
	tx := db.Where("TimeEntryId = ?", timeEntryId).
		Preload("ModifierUser").
		Find(&logs)
	if tx.Error != nil {
		return nil, tx.Error
	}

	historyChanges := []HistoryModel{}

	for i, logEntry := range logs {
		//copy time objects
		start := logEntry.StartTimeUtc
		end := logEntry.EndTimeUtc

		switch domain.LogType(logEntry.LogTypeId) {
		case domain.InsertLogType:
			historyChanges = append(historyChanges, HistoryModel{
				Action:         EntryCreated,
				ModifierUserId: logEntry.ModifierUserId,
				ModifierName:   logEntry.ModifierUser.DisplayName,
				StartTimeUtc:   &start,
				EndTimeUtc:     &end,
				InsertedOnUtc:  logEntry.InsertedOnUtc,
			})
			break
		case domain.UpdateLogType:
			if len(logs)-1 >= 0 && i > 0 {
				prevLog := logs[i-1]
				if prevLog.StartTimeUtc != start || prevLog.EndTimeUtc != end {
					historyChanges = append(historyChanges, HistoryModel{
						Action:         TimeChange,
						ModifierUserId: logEntry.ModifierUserId,
						ModifierName:   logEntry.ModifierUser.DisplayName,
						StartTimeUtc:   &start,
						EndTimeUtc:     &end,
						InsertedOnUtc:  logEntry.InsertedOnUtc,
					})
				}

				if prevLog.PauseSeconds != logEntry.PauseSeconds {
					historyChanges = append(historyChanges, HistoryModel{
						Action:         PauseChange,
						ModifierUserId: logEntry.ModifierUserId,
						ModifierName:   logEntry.ModifierUser.DisplayName,
						PauseSeconds:   &logEntry.PauseSeconds,
						InsertedOnUtc:  logEntry.InsertedOnUtc,
					})
				}

			}

			break
		case domain.DeleteLogType:
			historyChanges = append(historyChanges, HistoryModel{
				Action:         EntryDeleted,
				ModifierUserId: logEntry.ModifierUserId,
				ModifierName:   logEntry.ModifierUser.DisplayName,
				InsertedOnUtc:  logEntry.InsertedOnUtc,
			})
			break
		}
	}
	return historyChanges, nil
}

func mapToTimeEntryLog(modifierUserId int64, entry *domain.TimeEntryModel, logType domain.LogType) domain.TimeEntryLogModel {
	model := domain.TimeEntryLogModel{
		StartTimeUtc:   entry.StartTimeUtc,
		EndTimeUtc:     entry.EndTimeUtc,
		PauseSeconds:   entry.PauseSeconds,
		TimeEntryId:    entry.Id,
		ModifierUserId: modifierUserId,
		LogTypeId:      int64(logType),
	}
	model.OnInsert()
	return model
}
