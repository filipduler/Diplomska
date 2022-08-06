package db

import (
	"time"
)

type timeEntryLogTable struct{ *store }

type TimeEntryLogModel struct {
	StartTimeUtc  time.Time `db:"StartTimeUtc"`
	EndTimeUtc    time.Time `db:"EndTimeUtc"`
	IsDeleted     bool      `db:"IsDeleted"`
	UserId        int64     `db:"UserId"`
	TimeEntryId   int64     `db:"TimeEntryId"`
	LogTypeId     int64     `db:"LogTypeId"`
	InsertedOnUtc time.Time `db:"InsertedOnUtc"`
}

func (store *timeEntryLogTable) GetByTimeEntryId(timeEntryId int64) ([]TimeEntryLogModel, error) {
	tf := []TimeEntryLogModel{}
	err := store.db.Select(&tf, "SELECT * FROM TimeEntryLog WHERE TimeEntryId = ?", timeEntryId)
	if err != nil {
		return nil, err
	}
	return tf, nil
}

func (store *timeEntryLogTable) GetLastEntryByRange(userId int64, from *time.Time, to *time.Time) ([]TimeEntryLogModel, error) {
	tf := []TimeEntryLogModel{}
	err := store.db.Select(&tf, `WITH last_log_entries AS (
			SELECT m.*, ROW_NUMBER() OVER (PARTITION BY TimeEntryId ORDER BY InsertedOnUtc DESC) AS rn
			FROM timeentrylog AS m
			WHERE m.UserId = ?
		)
		SELECT StartTimeUtc, EndTimeUtc, IsDeleted, UserId, TimeEntryId, LogTypeId, InsertedOnUtc
		FROM last_log_entries WHERE rn = 1`, userId)
	if err != nil {
		return nil, err
	}
	return tf, nil
}

func (store *timeEntryLogTable) Insert(tel *TimeEntryLogModel) error {
	tel.InsertedOnUtc = time.Now()

	_, err := store.Exec(`INSERT INTO TimeEntryLog (StartTimeUtc, EndTimeUtc, IsDeleted, UserId, TimeEntryId, LogTypeId, InsertedOnUtc) 
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		tel.StartTimeUtc,
		tel.EndTimeUtc,
		tel.IsDeleted,
		tel.UserId,
		tel.TimeEntryId,
		tel.LogTypeId,
		tel.InsertedOnUtc)
	return err
}
