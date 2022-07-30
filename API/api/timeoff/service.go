package timeoff

import (
	"api/db"
	"errors"

	"github.com/samber/lo"
)

type Status int64

const (
	Pending  Status = 1
	Accepted Status = 2
	Rejected Status = 3
	Canceled Status = 4
)

type Type int64

const (
	Vacation Type = 1
	Medical  Type = 2
	Other    Type = 3
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

/*func newEntry(start time.Time, end time.Time, note string, userId int64) error {
	dbStore := db.New()

	_, err := dbStore.TimeEntry.Insert(&db.TimeEntryModel{
		StartTimeUtc: start,
		EndTimeUtc:   &end,
		Note:         note,
		IsDeleted:    false,
		UserId:       userId,
	})
	return err
}*/

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

	/*err = dbStore.StartTransaction()
	if err != nil {
		return err
	}*/

	to.TimeOffStatusTypeId = int64(Canceled)
	return dbStore.TimeOff.Update(to)

	/*err = dbStore.TimeEntryLog.Insert(&db.TimeEntryLogModel{
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

	return dbStore.Commit()*/
}

/*func hasAccess(ta *db.TimeEntryModel, userId int64) bool {
	//TODO if user IsAdmin give access
	return ta.UserId == userId
}*/

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
