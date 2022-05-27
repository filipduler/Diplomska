package db

import (
	"time"
)

type TimeEntryLog struct {
	StartTimeUtc  time.Time  `db:"StartTimeUtc"`
	EndTimeUtc    *time.Time `db:"EndTimeUtc"`
	DailyHours    float64    `db:"DailyHours"`
	Node          string     `db:"Node"`
	ChangeReason  string     `db:"ChangeReason"`
	UserId        int64      `db:"UserId"`
	TimeEntryId   int64      `db:"TimeEntryId"`
	InsertedOnUtc time.Time  `db:"InsertedOnUtc"`
}

func (store *DBStore) InsertTimeEntryLog(tel TimeEntryLog) error {
	_, err := store.Exec("INSERT INTO TimeEntryLog (StartTimeUtc, EndTimeUtc, DailyHours, Note, ChangeReason, UserId, TimeEntryId, InsertedOnUtc) VALUES (?, ?, ?, ?, ?, ?)",
		tel.StartTimeUtc,
		tel.EndTimeUtc,
		tel.DailyHours,
		tel.Node,
		tel.ChangeReason,
		tel.UserId,
		tel.TimeEntryId,
		tel.InsertedOnUtc)
	return err
}
