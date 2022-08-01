package entry

import (
	"api/db"
	"errors"
	"time"

	"github.com/samber/lo"
)

var (
	ErrNoActiveTimer = errors.New("no active timers available")
	ErrInvalidAccess = errors.New("user doesn't have access to time entry")
)

func getEntry(timeEntryId int64, user *db.UserModel) (*entryModel, error) {
	dbStore := db.New()

	entry, err := dbStore.TimeEntry.GetById(timeEntryId)
	if err != nil {
		return nil, err
	}

	if entry.UserId != user.Id {
		return nil, ErrInvalidAccess
	}

	day := entry.StartTimeUtc.Day()
	return &entryModel{
		Id:              entry.Id,
		StartTimeUtc:    entry.StartTimeUtc,
		EndTimeUtc:      *entry.EndTimeUtc,
		TimeDiffSeconds: int(entry.EndTimeUtc.Sub(entry.StartTimeUtc).Seconds()),
		Note:            entry.Note,
		Day:             day,
	}, nil
}

func getEntries(month int, year int, user *db.UserModel) (*entriesResponse, error) {
	dbStore := db.New()

	entries, err := dbStore.TimeEntry.GetByMonth(user.Id, month, year)
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

func saveEntry(request *saveEntryRequest, user *db.UserModel) (int64, error) {
	dbStore := db.New()

	var model *db.TimeEntryModel = nil

	err := dbStore.StartTransaction()
	if err != nil {
		return 0, err
	}

	endTime := request.EndTime.UTC()

	id := lo.FromPtrOr(request.Id, 0)
	if id == 0 {
		model = &db.TimeEntryModel{
			StartTimeUtc: request.StartTime.UTC(),
			EndTimeUtc:   &endTime,
			Note:         request.Note,
			IsDeleted:    false,
			UserId:       user.Id,
		}
		timeOffId, err := dbStore.TimeEntry.Insert(model)
		if err != nil {
			return 0, err
		}
		model.Id = timeOffId
	} else {
		model, err = dbStore.TimeEntry.GetById(id)
		if err != nil {
			return 0, err
		}

		if model.UserId != user.Id {
			return 0, ErrInvalidAccess
		}

		model.StartTimeUtc = request.StartTime.UTC()
		model.EndTimeUtc = &endTime
		model.Note = request.Note

		err = dbStore.TimeEntry.Update(model)
		if err != nil {
			return 0, err
		}
	}

	log := mapToEntryLog(user.Id, model)
	err = dbStore.TimeEntryLog.Insert(&log)

	if err != nil {
		_ = dbStore.Rollback()
		return 0, err
	}

	return model.Id, dbStore.Commit()
}

func deleteEntry(timeEntryId int64, user *db.UserModel) error {
	dbStore := db.New()

	te, err := dbStore.TimeEntry.GetById(timeEntryId)
	if err != nil {
		return err
	}

	if te.UserId != user.Id {
		return ErrInvalidAccess
	}

	te.IsDeleted = true
	err = dbStore.TimeEntry.Update(te)

	return err
}

func startTimerEntry(user *db.UserModel) (*timerModel, error) {
	dbStore := db.New()
	now := time.Now()

	timeEntryId, err := dbStore.TimeEntry.Insert(&db.TimeEntryModel{
		StartTimeUtc: now,
		EndTimeUtc:   nil,
		Note:         "",
		DailyHours:   8, //TODO FIX
		IsDeleted:    false,
		UserId:       user.Id,
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

func checkTimerEntry(user *db.UserModel) (*timerModel, error) {
	dbStore := db.New()
	te, err := dbStore.TimeEntry.GetUnfinishedDaily(user.Id)

	if err == nil {
		return &timerModel{
			Id:           te.Id,
			StartTimeUtc: te.StartTimeUtc,
		}, nil
	}
	return nil, err
}

func stopTimerEntry(timeEntryId int64, user *db.UserModel) error {
	dbStore := db.New()

	te, err := dbStore.TimeEntry.GetById(timeEntryId)

	if err == nil {
		now := time.Now()

		if te.UserId != user.Id {
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

func cancelTimerEntry(user *db.UserModel) error {
	dbStore := db.New()
	return dbStore.TimeEntry.DeleteUnfinished(user.Id)
}

func mapToEntryLog(userId int64, entry *db.TimeEntryModel) db.TimeEntryLogModel {
	return db.TimeEntryLogModel{
		StartTimeUtc: entry.StartTimeUtc,
		EndTimeUtc:   entry.EndTimeUtc,
		TimeEntryId:  entry.Id,
		UserId:       userId,
	}
}
