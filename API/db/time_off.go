package db

import (
	"time"
)

type timeOffTable struct{ *store }

type TimeOffModel struct {
	BaseModel
	StartTimeUtc        time.Time `db:"StartTimeUtc"`
	EndTimeUtc          time.Time `db:"EndTimeUtc"`
	TimeOffTypeId       int64     `db:"TimeOffTypeId"`
	TimeOffStatusTypeId int64     `db:"TimeOffStatusTypeId"`
	UserId              int64     `db:"UserId"`
}

func (store *timeOffTable) GetByUserId(userId int64) ([]TimeOffModel, error) {
	tf := []TimeOffModel{}
	err := store.DB.Select(&tf, "SELECT * FROM TimeOff WHERE UserId = ?", userId)
	if err != nil {
		return nil, err
	}
	return tf, nil
}

func (store *timeOffTable) GetById(id int64) (*TimeOffModel, error) {
	tf := &TimeOffModel{}
	err := store.DB.Get(tf, "SELECT * FROM TimeOff WHERE Id = ?", id)
	if err != nil {
		return nil, err
	}
	return tf, nil
}

func (store *timeOffTable) Insert(tf *TimeOffModel) (int64, error) {
	tf.BeforeInsert()

	res, err := store.DB.Exec("INSERT INTO TimeOff (StartTimeUtc, EndTimeUtc, TimeOffTypeId, TimeOffStatusTypeId, UserId, InsertedOnUtc, UpdatedOnUtc) "+
		"VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		tf.StartTimeUtc,
		tf.EndTimeUtc,
		tf.TimeOffTypeId,
		tf.TimeOffStatusTypeId,
		tf.UserId,
		tf.InsertedOnUtc,
		tf.UpdatedOnUtc)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (store *timeOffTable) Update(tf *TimeOffModel) error {
	tf.BeforeUpdate()

	_, err := store.DB.Exec("UPDATE TimeOff SET StartTimeUtc = ?, EndTimeUtc = ?, TimeOffTypeId = ?, TimeOffStatusTypeId = ?, UpdatedOnUtc = ? WHERE Id = ?",
		tf.StartTimeUtc,
		tf.EndTimeUtc,
		tf.TimeOffTypeId,
		tf.TimeOffStatusTypeId,
		tf.UpdatedOnUtc,
		tf.Id)
	return err
}
