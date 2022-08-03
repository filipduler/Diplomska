package db

import (
	"time"
)

type timeEntryLogTable struct{ *store }

type TimeEntryLogModel struct {
	StartTimeUtc  time.Time  `db:"StartTimeUtc"`
	EndTimeUtc    *time.Time `db:"EndTimeUtc"`
	IsDeleted     bool       `db:"IsDeleted"`
	UserId        int64      `db:"UserId"`
	TimeEntryId   int64      `db:"TimeEntryId"`
	InsertedOnUtc time.Time  `db:"InsertedOnUtc"`
}

func (store *timeEntryLogTable) GetByTimeEntryId(timeEntryId int64) ([]TimeEntryLogModel, error) {
	tf := []TimeEntryLogModel{}
	err := store.db.Select(&tf, "SELECT * FROM TimeEntryLog WHERE TimeEntryId = ?", timeEntryId)
	if err != nil {
		return nil, err
	}
	return tf, nil
}

func (store *timeEntryLogTable) Insert(tel *TimeEntryLogModel) error {
	tel.InsertedOnUtc = time.Now()

	_, err := store.Exec("INSERT INTO TimeEntryLog (StartTimeUtc, EndTimeUtc, IsDeleted, UserId, TimeEntryId, InsertedOnUtc) VALUES (?, ?, ?, ?, ?, ?)",
		tel.StartTimeUtc,
		tel.EndTimeUtc,
		tel.IsDeleted,
		tel.UserId,
		tel.TimeEntryId,
		tel.InsertedOnUtc)
	return err
}
