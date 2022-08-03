package entry

import (
	"api/api"
	apiutils "api/api/api_utils"
	"api/db"
	"errors"
	"time"

	"github.com/samber/lo"
)

var (
	ErrNoActiveTimer = errors.New("no active timers available")
)

func getEntry(timeEntryId int64, user *db.UserModel) (*entryModel, error) {
	dbStore := db.New()

	entry, err := dbStore.TimeEntry.GetById(timeEntryId)
	if err != nil {
		return nil, err
	}

	if entry.UserId != user.Id {
		return nil, api.ErrIncorrectPermissions
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
	endTime := request.EndTime.UTC()
	id := lo.FromPtrOr(request.Id, 0)

	err := dbStore.Transact(func() error {
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
				return err
			}
			model.Id = timeOffId
		} else {
			var err error
			model, err = dbStore.TimeEntry.GetById(id)
			if err != nil {
				return err
			}

			if model.UserId != user.Id {
				return api.ErrIncorrectPermissions
			}

			model.StartTimeUtc = request.StartTime.UTC()
			model.EndTimeUtc = &endTime
			model.Note = request.Note

			err = dbStore.TimeEntry.Update(model)
			if err != nil {
				return err
			}
		}

		log := mapToEntryLog(user.Id, model)
		return dbStore.TimeEntryLog.Insert(&log)
	})

	if err != nil {
		return 0, err
	}

	return model.Id, nil
}

func deleteEntry(timeEntryId int64, user *db.UserModel) error {
	dbStore := db.New()

	te, err := dbStore.TimeEntry.GetById(timeEntryId)
	if err != nil {
		return err
	}

	if te.UserId != user.Id {
		return api.ErrIncorrectPermissions
	}

	te.IsDeleted = true
	dbStore.Transact(func() error {
		err := dbStore.TimeEntry.Update(te)
		if err != nil {
			return err
		}

		log := mapToEntryLog(user.Id, te)
		return dbStore.TimeEntryLog.Insert(&log)
	})

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
			return api.ErrIncorrectPermissions
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

func entryHistory(timeEntryId int64, user *db.UserModel) (map[time.Time][]historyModel, error) {
	dbStore := db.New()

	to, err := dbStore.TimeEntry.GetById(timeEntryId)
	if err != nil {
		return nil, err
	}

	if to.UserId != user.Id {
		return nil, api.ErrIncorrectPermissions
	}

	logs, err := dbStore.TimeEntryLog.GetByTimeEntryId(timeEntryId)
	if err != nil {
		return nil, err
	}

	userIds := lo.Map(logs, func(log db.TimeEntryLogModel, _ int) int64 { return log.UserId })
	uniqueUserIds := lo.Uniq(userIds)
	userMap, err := apiutils.GetUserMap(uniqueUserIds, &dbStore)
	if err != nil {
		return nil, err
	}

	historyMap := map[time.Time][]historyModel{}

	for i, logEntry := range logs {
		logMessages := []historyModel{}

		//load modifier user
		curUser := userMap[logEntry.UserId]

		//copy time objects
		start := logEntry.StartTimeUtc
		end := logEntry.EndTimeUtc

		if i == 0 {
			logMessages = append(logMessages, historyModel{
				Action:          EntryCreated,
				ModifiedByOwner: logEntry.UserId == to.UserId,
				ModifierName:    curUser.DisplayName,
				StartTimeUtc:    &start,
				EndTimeUtc:      end,
			})
		} else {
			prevLog := logs[i-1]
			if prevLog.StartTimeUtc != start || prevLog.EndTimeUtc != end {
				logMessages = append(logMessages, historyModel{
					Action:          TimeChange,
					ModifiedByOwner: logEntry.UserId == to.UserId,
					ModifierName:    curUser.DisplayName,
					StartTimeUtc:    &start,
					EndTimeUtc:      end,
				})
			}

			if logEntry.IsDeleted {
				logMessages = append(logMessages, historyModel{
					Action:          EntryDeleted,
					ModifiedByOwner: logEntry.UserId == to.UserId,
					ModifierName:    curUser.DisplayName,
				})
			}
		}
		historyMap[logEntry.InsertedOnUtc] = logMessages
	}
	return historyMap, nil
}

func mapToEntryLog(userId int64, entry *db.TimeEntryModel) db.TimeEntryLogModel {
	return db.TimeEntryLogModel{
		StartTimeUtc: entry.StartTimeUtc,
		EndTimeUtc:   entry.EndTimeUtc,
		IsDeleted:    entry.IsDeleted,
		TimeEntryId:  entry.Id,
		UserId:       userId,
	}
}
