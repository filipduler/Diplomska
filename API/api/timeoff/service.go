package timeoff

import (
	"api/api"
	apiutils "api/api/api_utils"
	"api/db"
	"time"

	"github.com/samber/lo"
)

func getEntries(user *db.UserModel) ([]timeOffModel, error) {
	dbStore := db.New()

	entries, err := dbStore.TimeOff.GetByUserId(user.Id)
	if err != nil {
		return nil, err
	}

	typeMap, err := getTimeOffTypeMap(&dbStore)
	if err != nil {
		return nil, err
	}

	res := []timeOffModel{}
	for _, entry := range entries {
		if resEntry, ok := mapEntry(&entry, typeMap); ok {
			res = append(res, *resEntry)
		}
	}

	return res, nil
}

func getEntry(timeOffId int64, user *db.UserModel) (*timeOffDetailsModel, error) {
	dbStore := db.New()

	entry, err := dbStore.TimeOff.GetById(timeOffId)
	if err != nil {
		return nil, err
	}

	if entry.UserId != user.Id {
		return nil, api.ErrIncorrectPermissions
	}

	typeMap, err := getTimeOffTypeMap(&dbStore)
	if err != nil {
		return nil, err
	}

	if resEntry, ok := mapEntry(entry, typeMap); ok {
		return &timeOffDetailsModel{
			timeOffModel:  *resEntry,
			IsCancellable: entry.TimeOffStatusTypeId == int64(db.PendingTimeOffStatus),
			IsFinished:    entry.TimeOffStatusTypeId != int64(db.PendingTimeOffStatus),
		}, nil
	}

	return nil, api.ErrEntryNotFound
}

func getTypes() ([]typeModel, error) {
	dbStore := db.New()
	types, err := dbStore.TimeOffType.Get()
	if err != nil {
		return nil, err
	}

	return lo.Map(types, func(t db.TimeOffTypeModel, _ int) typeModel {
		return typeModel{
			Id:   t.Id,
			Name: t.Name,
		}
	}), nil
}

func saveEntry(request *saveRequest, user *db.UserModel) (int64, error) {
	dbStore := db.New()
	var model *db.TimeOffModel = nil
	id := lo.FromPtrOr(request.Id, 0)

	err := dbStore.Transact(func() error {
		if id == 0 {
			model = &db.TimeOffModel{
				StartTimeUtc:        request.StartTime.UTC(),
				EndTimeUtc:          request.EndTime.UTC(),
				Note:                request.Note,
				TimeOffTypeId:       request.TypeId,
				TimeOffStatusTypeId: int64(db.PendingTimeOffStatus),
				UserId:              user.Id,
			}
			timeOffId, err := dbStore.TimeOff.Insert(model)
			if err != nil {
				return err
			}
			model.Id = timeOffId
		} else {
			var err error
			model, err = dbStore.TimeOff.GetById(id)
			if err != nil {
				return err
			}
			model.StartTimeUtc = request.StartTime.UTC()
			model.EndTimeUtc = request.EndTime.UTC()
			model.Note = request.Note
			model.TimeOffTypeId = int64(request.TypeId)

			err = dbStore.TimeOff.Update(model)
			if err != nil {
				return err
			}
		}

		log := mapToEntryLog(user.Id, model, lo.Ternary(id > 0, db.UpdateLogType, db.InsertLogType))
		return dbStore.TimeOffLog.Insert(&log)
	})

	if err != nil {
		return 0, err
	}

	return model.Id, nil
}

func closeEntryStatus(timeOffId int64, user *db.UserModel) error {
	dbStore := db.New()

	to, err := dbStore.TimeOff.GetById(timeOffId)
	if err != nil {
		return err
	}

	//if request is not pending return success
	if to.TimeOffStatusTypeId != int64(db.PendingTimeOffStatus) {
		return nil
	}

	if to.UserId != user.Id {
		return api.ErrIncorrectPermissions
	}

	return dbStore.Transact(func() error {
		to.TimeOffStatusTypeId = int64(db.CanceledTimeOffStatus)
		err = dbStore.TimeOff.Update(to)
		if err != nil {
			return err
		}

		log := mapToEntryLog(user.Id, to, db.DeleteLogType)
		return dbStore.TimeOffLog.Insert(&log)
	})
}

func entryHistory(timeOffId int64, user *db.UserModel) (map[time.Time][]historyModel, error) {
	dbStore := db.New()

	to, err := dbStore.TimeOff.GetById(timeOffId)
	if err != nil {
		return nil, err
	}

	if to.UserId != user.Id {
		return nil, api.ErrIncorrectPermissions
	}

	logs, err := dbStore.TimeOffLog.GetByTimeOffId(timeOffId)
	if err != nil {
		return nil, err
	}

	typeMap, err := getTimeOffTypeMap(&dbStore)
	if err != nil {
		return nil, err
	}

	userIds := lo.Map(logs, func(log db.TimeOffLogModel, _ int) int64 { return log.UserId })
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
			name := typeMap[logEntry.TimeOffTypeId].Name
			logMessages = append(logMessages, historyModel{
				Action:          RequestOpen,
				ModifiedByOwner: logEntry.UserId == to.UserId,
				ModifierName:    curUser.DisplayName,
				StartTimeUtc:    &start,
				EndTimeUtc:      &end,
				Type:            &name,
			})
		} else {
			prevLog := logs[i-1]
			if prevLog.StartTimeUtc != start || prevLog.EndTimeUtc != end {
				logMessages = append(logMessages, historyModel{
					Action:          TimeChange,
					ModifiedByOwner: logEntry.UserId == to.UserId,
					ModifierName:    curUser.DisplayName,
					StartTimeUtc:    &start,
					EndTimeUtc:      &end,
				})
			}

			if prevLog.TimeOffTypeId != logEntry.TimeOffTypeId {
				name := typeMap[logEntry.TimeOffTypeId].Name
				logMessages = append(logMessages, historyModel{
					Action:          TypeChange,
					ModifiedByOwner: logEntry.UserId == to.UserId,
					ModifierName:    curUser.DisplayName,
					Type:            &name,
				})
			}

			if prevLog.TimeOffStatusTypeId != logEntry.TimeOffStatusTypeId &&
				(logEntry.TimeOffStatusTypeId == int64(db.AcceptedTimeOffStatus) ||
					logEntry.TimeOffStatusTypeId == int64(db.RejectedTimeOffStatus) ||
					logEntry.TimeOffStatusTypeId == int64(db.CanceledTimeOffStatus)) {
				status := logEntry.TimeOffStatusTypeId
				logMessages = append(logMessages, historyModel{
					Action:          RequestClosed,
					ModifiedByOwner: logEntry.UserId == to.UserId,
					ModifierName:    curUser.DisplayName,
					Status:          &status,
				})
			}
		}
		historyMap[logEntry.InsertedOnUtc] = logMessages
	}
	return historyMap, nil
}

func getTimeOffTypeMap(dbStore *db.DBStore) (map[int64]db.TimeOffTypeModel, error) {
	entries, err := dbStore.TimeOffType.Get()
	if err != nil {
		return nil, err
	}

	return lo.KeyBy(entries, func(entry db.TimeOffTypeModel) int64 { return entry.Id }), nil
}

func mapEntry(entry *db.TimeOffModel, typeMap map[int64]db.TimeOffTypeModel) (*timeOffModel, bool) {

	if timeOffType, ok := typeMap[entry.TimeOffTypeId]; ok {
		return &timeOffModel{
			Id:           entry.Id,
			StartTimeUtc: entry.StartTimeUtc,
			EndTimeUtc:   entry.EndTimeUtc,
			Note:         entry.Note,
			Type: typeModel{
				Id:   timeOffType.Id,
				Name: timeOffType.Name,
			},
			Status: entry.TimeOffStatusTypeId,
		}, true
	}
	return nil, false
}

func mapToEntryLog(userId int64, entry *db.TimeOffModel, logType db.LogType) db.TimeOffLogModel {
	return db.TimeOffLogModel{
		StartTimeUtc:        entry.StartTimeUtc,
		EndTimeUtc:          entry.EndTimeUtc,
		TimeOffTypeId:       entry.TimeOffTypeId,
		TimeOffStatusTypeId: entry.TimeOffStatusTypeId,
		TimeOffId:           entry.Id,
		UserId:              userId,
		LogTypeId:           int64(logType),
	}
}
