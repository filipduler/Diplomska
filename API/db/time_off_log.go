package db

import (
	"fmt"
	"time"
)

type timeOffLogTable struct{ *store }

type TimeOffLogModel struct {
	StartTimeUtc        time.Time `db:"StartTimeUtc"`
	EndTimeUtc          time.Time `db:"EndTimeUtc"`
	TimeOffTypeId       int64     `db:"TimeOffTypeId"`
	TimeOffStatusTypeId int64     `db:"TimeOffStatusTypeId"`
	TimeOffId           int64     `db:"TimeOffId"`
	UserId              int64     `db:"UserId"`
	LogTypeId           int64     `db:"LogTypeId"`
	InsertedOnUtc       time.Time `db:"InsertedOnUtc"`
}

func (store *timeOffLogTable) GetByTimeOffId(timeOffId int64) ([]TimeOffLogModel, error) {
	tf := []TimeOffLogModel{}
	err := store.db.Select(&tf, "SELECT * FROM TimeOffLog WHERE TimeOffId = ?", timeOffId)
	if err != nil {
		return nil, err
	}
	return tf, nil
}

func (store *timeOffLogTable) GetLastEntryByRange(userId int64, from *time.Time, to *time.Time) ([]TimeOffLogModel, error) {
	tf := []TimeOffLogModel{}

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

	err := store.db.Select(&tf, fmt.Sprintf(`WITH last_log_entries AS (
			SELECT m.*, ROW_NUMBER() OVER (PARTITION BY TimeOffId ORDER BY InsertedOnUtc DESC) AS rn
			FROM timeofflog AS m
			WHERE m.UserId = ? %s
		)
		SELECT StartTimeUtc, EndTimeUtc, TimeOffTypeId, TimeOffStatusTypeId, TimeOffId, LogTypeId, UserId, InsertedOnUtc
		FROM last_log_entries WHERE rn = 1`, dateQuery), args...)
	if err != nil {
		return nil, err
	}
	return tf, nil
}

func (store *timeOffLogTable) Insert(tf *TimeOffLogModel) error {
	tf.InsertedOnUtc = time.Now().UTC()
	_, err := store.Exec(`INSERT INTO TimeOffLog 
			(StartTimeUtc, EndTimeUtc, TimeOffTypeId, TimeOffStatusTypeId, TimeOffId, UserId, LogTypeId, InsertedOnUtc)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		tf.StartTimeUtc,
		tf.EndTimeUtc,
		tf.TimeOffTypeId,
		tf.TimeOffStatusTypeId,
		tf.TimeOffId,
		tf.UserId,
		tf.LogTypeId,
		tf.InsertedOnUtc)
	return err
}
