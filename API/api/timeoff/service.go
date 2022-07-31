package timeoff

import (
	"api/db"
	"errors"
	"time"

	"github.com/samber/lo"
)

type timeOffStatus int64

const (
	Pending  timeOffStatus = 1
	Accepted timeOffStatus = 2
	Rejected timeOffStatus = 3
	Canceled timeOffStatus = 4
)

type timeOffType int64

const (
	Vacation timeOffType = 1
	Medical  timeOffType = 2
	Other    timeOffType = 3
)

var (
	ErrIncorrectPermissions = errors.New("user doesn't have permissions to entry")
	ErrEntryNotFound        = errors.New("entry not found")
)

func getEntries(user *db.UserModel) ([]timeOffModel, error) {
	dbStore := db.New()

	entries, err := dbStore.TimeOff.GetByUserId(user.Id)
	if err != nil {
		return nil, err
	}

	statusMap, err := getTimeOffStatusTypeMap(&dbStore)
	if err != nil {
		return nil, err
	}

	typeMap, err := getTimeOffTypeMap(&dbStore)
	if err != nil {
		return nil, err
	}

	res := []timeOffModel{}
	for _, entry := range entries {
		if resEntry, ok := mapEntry(&entry, typeMap, statusMap); ok {
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
		return nil, ErrIncorrectPermissions
	}

	statusMap, err := getTimeOffStatusTypeMap(&dbStore)
	if err != nil {
		return nil, err
	}

	typeMap, err := getTimeOffTypeMap(&dbStore)
	if err != nil {
		return nil, err
	}

	if resEntry, ok := mapEntry(entry, typeMap, statusMap); ok {
		return &timeOffDetailsModel{
			timeOffModel:  *resEntry,
			IsCancellable: entry.TimeOffStatusTypeId == int64(Pending),
			IsFinished:    entry.TimeOffStatusTypeId != int64(Pending),
		}, nil
	}

	return nil, ErrEntryNotFound
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

	err := dbStore.StartTransaction()
	if err != nil {
		return 0, err
	}

	id := lo.FromPtrOr(request.Id, 0)
	if id == 0 {
		model = &db.TimeOffModel{
			StartTimeUtc:        request.StartTime.UTC(),
			EndTimeUtc:          request.EndTime.UTC(),
			Note:                request.Note,
			TimeOffTypeId:       request.TypeId,
			TimeOffStatusTypeId: int64(Pending),
			UserId:              user.Id,
		}
		timeOffId, err := dbStore.TimeOff.Insert(model)
		if err != nil {
			return 0, err
		}
		model.Id = timeOffId
	} else {
		model, err = dbStore.TimeOff.GetById(id)
		if err != nil {
			return 0, err
		}
		model.StartTimeUtc = request.StartTime.UTC()
		model.EndTimeUtc = request.EndTime.UTC()
		model.Note = request.Note
		model.TimeOffTypeId = int64(request.TypeId)

		err = dbStore.TimeOff.Update(model)
		if err != nil {
			return 0, err
		}
	}

	log := mapToEntryLog(user.Id, model)
	err = dbStore.TimeOffLog.Insert(&log)

	if err != nil {
		_ = dbStore.Rollback()
		return 0, err
	}

	return model.Id, dbStore.Commit()
}

func closeEntryStatus(timeOffId int64, user *db.UserModel) error {
	dbStore := db.New()

	to, err := dbStore.TimeOff.GetById(timeOffId)
	if err != nil {
		return err
	}

	//if request is not pending return success
	if to.TimeOffStatusTypeId != int64(Pending) {
		return nil
	}

	if to.UserId != user.Id {
		return ErrIncorrectPermissions
	}

	err = dbStore.StartTransaction()
	if err != nil {
		return err
	}

	to.TimeOffStatusTypeId = int64(Canceled)
	err = dbStore.TimeOff.Update(to)
	if err != nil {
		return err
	}

	log := mapToEntryLog(user.Id, to)
	err = dbStore.TimeOffLog.Insert(&log)

	if err != nil {
		_ = dbStore.Rollback()
		return err
	}

	return dbStore.Commit()
}

func entryHistory(timeOffId int64, user *db.UserModel) (map[time.Time][]historyModel, error) {
	dbStore := db.New()

	to, err := dbStore.TimeOff.GetById(timeOffId)
	if err != nil {
		return nil, err
	}

	if to.UserId != user.Id {
		return nil, ErrIncorrectPermissions
	}

	logs, err := dbStore.TimeOffLog.GetByTimeOffId(timeOffId)
	if err != nil {
		return nil, err
	}

	statusMap, err := getTimeOffStatusTypeMap(&dbStore)
	if err != nil {
		return nil, err
	}

	typeMap, err := getTimeOffTypeMap(&dbStore)
	if err != nil {
		return nil, err
	}

	userIds := lo.Map(logs, func(log db.TimeOffLogModel, _ int) int64 { return log.UserId })
	uniqueUserIds := lo.Uniq(userIds)
	userMap, err := getUserMap(uniqueUserIds, &dbStore)
	if err != nil {
		return nil, err
	}

	historyMap := lo.SliceToMap(logs, func(log db.TimeOffLogModel) (time.Time, []historyModel) {
		return log.InsertedOnUtc, []historyModel{}
	})

	for i, log := range logs {
		logMessages := []historyModel{}

		//load modifier user
		curUser := userMap[log.UserId]

		if i == 0 {
			logMessages = append(logMessages, historyModel{
				Action:          RequestOpen,
				ModifiedByOwner: log.UserId == to.UserId,
				ModifierName:    curUser.DisplayName,
				StartTimeUtc:    &log.StartTimeUtc,
				EndTimeUtc:      &log.EndTimeUtc,
			})
		} else {
			prevLog := logs[i-1]
			if prevLog.StartTimeUtc != log.StartTimeUtc || prevLog.EndTimeUtc != log.EndTimeUtc {
				logMessages = append(logMessages, historyModel{
					Action:          TimeChange,
					ModifiedByOwner: log.UserId == to.UserId,
					ModifierName:    curUser.DisplayName,
					StartTimeUtc:    &log.StartTimeUtc,
					EndTimeUtc:      &log.EndTimeUtc,
				})
			}

			if prevLog.TimeOffTypeId != log.TimeOffTypeId {
				name := typeMap[log.TimeOffTypeId].Name
				logMessages = append(logMessages, historyModel{
					Action:          TypeChange,
					ModifiedByOwner: log.UserId == to.UserId,
					ModifierName:    curUser.DisplayName,
					Type:            &name,
				})
			}

			if prevLog.TimeOffStatusTypeId != log.TimeOffStatusTypeId &&
				(log.TimeOffStatusTypeId == int64(Accepted) ||
					log.TimeOffStatusTypeId == int64(Rejected) ||
					log.TimeOffStatusTypeId == int64(Canceled)) {
				name := statusMap[log.TimeOffStatusTypeId].Name
				logMessages = append(logMessages, historyModel{
					Action:          RequestClosed,
					ModifiedByOwner: log.UserId == to.UserId,
					ModifierName:    curUser.DisplayName,
					Status:          &name,
				})
			}
		}
		historyMap[log.InsertedOnUtc] = logMessages
	}

	return historyMap, nil
}

func getTimeOffStatusTypeMap(dbStore *db.DBStore) (map[int64]db.TimeOffStatusTypeModel, error) {
	statusEntries, err := dbStore.TimeOffStatusType.Get()
	if err != nil {
		return nil, err
	}

	return lo.KeyBy(statusEntries, func(entry db.TimeOffStatusTypeModel) int64 { return entry.Id }), nil
}

func getTimeOffTypeMap(dbStore *db.DBStore) (map[int64]db.TimeOffTypeModel, error) {
	entries, err := dbStore.TimeOffType.Get()
	if err != nil {
		return nil, err
	}

	return lo.KeyBy(entries, func(entry db.TimeOffTypeModel) int64 { return entry.Id }), nil
}

func getUserMap(userIds []int64, dbStore *db.DBStore) (map[int64]db.UserModel, error) {
	users, err := dbStore.User.GetByIds(userIds)
	if err != nil {
		return nil, err
	}

	return lo.KeyBy(users, func(user db.UserModel) int64 { return user.Id }), nil
}

func mapEntry(entry *db.TimeOffModel, typeMap map[int64]db.TimeOffTypeModel,
	statusMap map[int64]db.TimeOffStatusTypeModel) (*timeOffModel, bool) {

	timeOffType, okT := typeMap[entry.TimeOffTypeId]
	status, okS := statusMap[entry.TimeOffStatusTypeId]
	if okT && okS {
		return &timeOffModel{
			Id:           entry.Id,
			StartTimeUtc: entry.StartTimeUtc,
			EndTimeUtc:   entry.EndTimeUtc,
			Note:         entry.Note,
			Type: typeModel{
				Id:   timeOffType.Id,
				Name: timeOffType.Name,
			},
			Status: typeModel{
				Id:   status.Id,
				Name: status.Name,
			},
		}, true
	}
	return nil, false
}

func mapToEntryLog(userId int64, entry *db.TimeOffModel) db.TimeOffLogModel {
	return db.TimeOffLogModel{
		StartTimeUtc:        entry.StartTimeUtc,
		EndTimeUtc:          entry.EndTimeUtc,
		TimeOffTypeId:       entry.TimeOffTypeId,
		TimeOffStatusTypeId: entry.TimeOffStatusTypeId,
		TimeOffId:           entry.Id,
		UserId:              userId,
	}
}
