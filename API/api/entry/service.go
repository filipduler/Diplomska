package entry

import (
	"api/db"
	"errors"
	"time"
)

var (
	ErrNoActiveTimer = errors.New("no active timers available")
	ErrInvalidAccess = errors.New("user doesn't have access to time entry")
)

func getEntries(month int, year int, userId int64) (*entriesResponse, error) {
	dbStore := db.New()

	entries, err := dbStore.TimeEntry.GetByMonth(userId, month, year)
	if err != nil {
		return nil, err
	}

	res := entriesResponse{
		Year:    year,
		Month:   month,
		Entries: []entryModel{},
	}

	for _, element := range entries {
		if element.EndTimeUtc != nil {
			day := element.StartTimeUtc.Day()
			res.Entries = append(res.Entries, entryModel{
				Id:              element.Id,
				StartTimeUtc:    element.StartTimeUtc,
				EndTimeUtc:      *element.EndTimeUtc,
				TimeDiffSeconds: int(element.EndTimeUtc.Sub(element.StartTimeUtc).Seconds()),
				Note:            element.Note,
				Day:             day,
			})
		}

	}
	return &res, nil
}

func newEntry(start time.Time, end time.Time, note string, userId int64) error {
	dbStore := db.New()

	_, err := dbStore.TimeEntry.Insert(&db.TimeEntryModel{
		StartTimeUtc: start,
		EndTimeUtc:   &end,
		Note:         note,
		IsDeleted:    false,
		UserId:       userId,
	})
	return err
}

func updateEntry(timeEntryId int64, start time.Time, end time.Time, note string, userId int64) error {
	dbStore := db.New()

	te, err := dbStore.TimeEntry.GetById(timeEntryId)
	if err != nil {
		return err
	}

	if !hasAccess(te, userId) {
		return ErrInvalidAccess
	}

	err = dbStore.StartTransaction()
	if err != nil {
		return err
	}

	err = dbStore.TimeEntry.Update(&db.TimeEntryModel{
		BaseModel:    te.BaseModel,
		StartTimeUtc: start,
		EndTimeUtc:   &end,
		Note:         note,
		IsDeleted:    false,
	})
	if err != nil {
		return err
	}

	err = dbStore.TimeEntryLog.Insert(&db.TimeEntryLogModel{
		StartTimeUtc: te.StartTimeUtc,
		EndTimeUtc:   te.EndTimeUtc,
		ChangeReason: "",
		UserId:       userId,
		TimeEntryId:  te.Id,
	})

	if err != nil {
		dbStore.Rollback()
		return err
	}

	return dbStore.Commit()
}

func deleteEntry(timeEntryId int64, userId int64) error {
	dbStore := db.New()

	te, err := dbStore.TimeEntry.GetById(timeEntryId)
	if err != nil {
		return err
	}

	if !hasAccess(te, userId) {
		return ErrInvalidAccess
	}

	te.IsDeleted = true
	err = dbStore.TimeEntry.Update(te)

	return err
}

func startTimerEntry(userId int64) (*timerModel, error) {
	dbStore := db.New()
	now := time.Now()

	timeEntryId, err := dbStore.TimeEntry.Insert(&db.TimeEntryModel{
		StartTimeUtc: now,
		EndTimeUtc:   nil,
		Note:         "",
		DailyHours:   8, //TODO FIX
		IsDeleted:    false,
		UserId:       userId,
	})

	if err == nil {
		te, err := dbStore.TimeEntry.GetById(timeEntryId)
		if err == nil {
			return &timerModel{
				Id:           te.Id,
				StartTimeUtc: te.StartTimeUtc,
			}, nil
		} else {
			return nil, err
		}
	}

	return nil, err
}

func checkTimerEntry(userId int64) (*timerModel, error) {
	dbStore := db.New()
	te, err := dbStore.TimeEntry.GetUnfinishedDaily(userId)

	if err == nil {
		return &timerModel{
			Id:           te.Id,
			StartTimeUtc: te.StartTimeUtc,
		}, nil
	}
	return nil, err
}

func stopTimerEntry(timeEntryId int64, userId int64) error {
	dbStore := db.New()

	te, err := dbStore.TimeEntry.GetById(timeEntryId)

	if err == nil {
		now := time.Now()

		if !hasAccess(te, userId) {
			return ErrInvalidAccess
		}

		//check if its a valid timer
		if te.EndTimeUtc != nil || te.IsDeleted {
			return ErrNoActiveTimer
		}

		te.EndTimeUtc = &now
		err = dbStore.TimeEntry.Update(te)
		return err
	}

	return err
}

func cancelTimerEntry(userId int64) error {
	dbStore := db.New()
	return dbStore.TimeEntry.DeleteUnfinished(userId)
}

func hasAccess(ta *db.TimeEntryModel, userId int64) bool {
	//TODO if user IsAdmin give access
	return ta.UserId == userId
}
