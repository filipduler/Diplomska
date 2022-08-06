package history

import (
	"api/db"
	"time"

	"github.com/samber/lo"
)

func getHistory(request *historyRequest, user *db.UserModel) ([]historyEntryModel, error) {
	dbStore := db.New()

	tfEntries, err := getTimeOffHistory(user.Id, request.From, request.To, &dbStore)
	if err != nil {
		return nil, err
	}
	res := tfEntries

	teEntries, err := getTimeEntryHistory(user.Id, request.From, request.To, &dbStore)
	if err != nil {
		return nil, err
	}
	res = append(res, teEntries...)

	return res, nil
}

func getTimeOffHistory(userId int64, from *time.Time, to *time.Time, dbStore *db.DBStore) ([]historyEntryModel, error) {
	entires, err := dbStore.TimeOffLog.GetLastEntryByRange(userId, from, to)
	if err != nil {
		return nil, err
	}

	return lo.Map(entires, func(log db.TimeOffLogModel, _ int) historyEntryModel {
		return historyEntryModel{
			Id:              log.TimeOffId,
			Type:            TimeOff,
			StartTimeUtc:    log.StartTimeUtc,
			EndTimeUtc:      log.EndTimeUtc,
			LogType:         log.LogTypeId,
			LastUpdateOnUtc: log.InsertedOnUtc,
		}
	}), nil
}

func getTimeEntryHistory(userId int64, from *time.Time, to *time.Time, dbStore *db.DBStore) ([]historyEntryModel, error) {
	entires, err := dbStore.TimeEntryLog.GetLastEntryByRange(userId, from, to)
	if err != nil {
		return nil, err
	}

	return lo.Map(entires, func(log db.TimeEntryLogModel, _ int) historyEntryModel {
		return historyEntryModel{
			Id:              log.TimeEntryId,
			Type:            TimeEntry,
			StartTimeUtc:    log.StartTimeUtc,
			EndTimeUtc:      log.EndTimeUtc,
			LogType:         log.LogTypeId,
			LastUpdateOnUtc: log.InsertedOnUtc,
		}
	}), nil
}
