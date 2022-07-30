package db

import (
	"time"
)

type timeEntryLogTable struct{ *store }

type TimeEntryLogModel struct {
	StartTimeUtc  time.Time  `db:"StartTimeUtc"`
	EndTimeUtc    *time.Time `db:"EndTimeUtc"`
	DailyHours    float64    `db:"DailyHours"`
	Note          string     `db:"Note"`
	ChangeReason  string     `db:"ChangeReason"`
	UserId        int64      `db:"UserId"`
	TimeEntryId   int64      `db:"TimeEntryId"`
	InsertedOnUtc time.Time  `db:"InsertedOnUtc"`
}

func (store *timeEntryLogTable) Insert(tel *TimeEntryLogModel) error {
	tel.InsertedOnUtc = time.Now()

	_, err := store.Exec("INSERT INTO TimeEntryLog (StartTimeUtc, EndTimeUtc, DailyHours, Note, ChangeReason, UserId, TimeEntryId, InsertedOnUtc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		tel.StartTimeUtc,
		tel.EndTimeUtc,
		tel.DailyHours,
		tel.Note,
		tel.ChangeReason,
		tel.UserId,
		tel.TimeEntryId,
		tel.InsertedOnUtc)
	return err
}
