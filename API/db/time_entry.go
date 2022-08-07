package db

import (
	"time"
)

type timeEntryTable struct{ *store }

type TimeEntryModel struct {
	BaseModel
	StartTimeUtc time.Time  `db:"StartTimeUtc"`
	EndTimeUtc   *time.Time `db:"EndTimeUtc"`
	DailyHours   float64    `db:"DailyHours"`
	Note         string     `db:"Note"`
	IsDeleted    bool       `db:"IsDeleted"`
	UserId       int64      `db:"UserId"`
}

func (store *timeEntryTable) Insert(te *TimeEntryModel) (int64, error) {
	te.BeforeInsert()

	res, err := store.Exec(`INSERT INTO TimeEntry (StartTimeUtc, EndTimeUtc, Note, DailyHours, IsDeleted, UserId, InsertedOnUtc, UpdatedOnUtc) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		te.StartTimeUtc,
		te.EndTimeUtc,
		te.Note,
		te.DailyHours,
		te.IsDeleted,
		te.UserId,
		te.InsertedOnUtc,
		te.UpdatedOnUtc)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (store *timeEntryTable) Update(te *TimeEntryModel) error {
	te.BeforeUpdate()

	_, err := store.Exec(`UPDATE TimeEntry SET StartTimeUtc = ?, EndTimeUtc = ?, Note = ?, IsDeleted = ?, UpdatedOnUtc = ? 
		WHERE Id = ?`,
		te.StartTimeUtc,
		te.EndTimeUtc,
		te.Note,
		te.IsDeleted,
		te.UpdatedOnUtc,
		te.Id)
	return err
}

func (store *timeEntryTable) DeleteUnfinished(userId int64) error {
	_, err := store.Exec("DELETE FROM TimeEntry WHERE UserId = ? AND EndTimeUtc IS NULL", userId)
	return err
}

func (store *timeEntryTable) GetValidByMonth(userId int64, month int, year int) ([]TimeEntryModel, error) {
	te := []TimeEntryModel{}
	err := store.db.Select(&te, `SELECT * FROM validtimeentry 
		WHERE UserId = ? AND MONTH(StartTimeUtc) = ? AND YEAR(StartTimeUtc) = ?`, userId, month, year)
	if err != nil {
		return nil, err
	}
	return te, nil
}

func (store *timeEntryTable) GetValidFrom(userId int64, from time.Time) ([]TimeEntryModel, error) {
	te := []TimeEntryModel{}
	err := store.db.Select(&te, `SELECT * FROM validtimeentry WHERE UserId = ? AND StartTimeUtc > ?`, userId, from)
	if err != nil {
		return nil, err
	}
	return te, nil
}

func (store *timeEntryTable) GetUnfinishedDaily(userId int64) (*TimeEntryModel, error) {
	te := TimeEntryModel{}
	err := store.db.Get(&te, `SELECT * FROM TimeEntry 
		WHERE UserId = ? AND StartTimeUtc >= UTC_TIMESTAMP() - INTERVAL 1 DAY 
		AND IsDeleted = 0 AND EndTimeUtc IS NULL 
		ORDER BY StartTimeUtc DESC LIMIT 1`, userId)

	if err != nil {
		return nil, err
	}
	return &te, nil
}

func (store *timeEntryTable) GetById(id int64) (*TimeEntryModel, error) {
	te := TimeEntryModel{}
	err := store.db.Get(&te, `SELECT * FROM TimeEntry WHERE Id = ?`, id)
	if err != nil {
		return nil, err
	}
	return &te, nil
}
