package history

import (
	"api/db"

	"github.com/samber/lo"
)

func getHistory(request *historyRequest, user *db.UserModel) ([]historyEntryModel, error) {
	dbStore := db.New()

	tfEntries, err := getTimeOffHistory(user.Id, &dbStore)
	if err != nil {
		return nil, err
	}
	res := tfEntries

	teEntries, err := getTimeEntryHistory(user.Id, &dbStore)
	if err != nil {
		return nil, err
	}
	res = append(res, teEntries...)

	return res, nil
}

func getTimeOffHistory(userId int64, dbStore *db.DBStore) ([]historyEntryModel, error) {
	entires, err := dbStore.TimeOffLog.GetLastEntryByRange(userId, nil, nil)
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

func getTimeEntryHistory(userId int64, dbStore *db.DBStore) ([]historyEntryModel, error) {
	entires, err := dbStore.TimeEntryLog.GetLastEntryByRange(userId, nil, nil)
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
