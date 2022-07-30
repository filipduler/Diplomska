package db

import (
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
	InsertedOnUtc       time.Time `db:"InsertedOnUtc"`
}

/*func (store *timeOffTable) GetByUserId(userId int64) ([]TimeOffModel, error) {
	tf := []TimeOffModel{}
	err := store.DB.Select(&tf, "SELECT * FROM TimeOff WHERE UserId = ?", userId)
	if err != nil {
		return nil, err
	}
	return tf, nil
}*/

func (store *timeOffLogTable) Insert(tf *TimeOffLogModel) error {
	tf.InsertedOnUtc = time.Now().UTC()
	_, err := store.DB.Exec("INSERT INTO TimeOffLog (StartTimeUtc, EndTimeUtc, TimeOffTypeId, TimeOffStatusTypeId, TimeOffId, UserId, InsertedOnUtc) "+
		"VALUES (?, ?, ?, ?, ?, ?, ?)",
		tf.StartTimeUtc,
		tf.EndTimeUtc,
		tf.TimeOffTypeId,
		tf.TimeOffStatusTypeId,
		tf.TimeOffId,
		tf.UserId,
		tf.InsertedOnUtc)
	return err
}
