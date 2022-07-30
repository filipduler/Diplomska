package timeoff

import (
	"api/db"

	"github.com/samber/lo"
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

	res := make([]timeOffModel, len(entries))
	for i, entry := range entries {
		res[i] = timeOffModel{
			Id:           entry.Id,
			StartTimeUtc: entry.StartTimeUtc,
			EndTimeUtc:   entry.EndTimeUtc,
			Type:         typeMap[entry.TimeOffTypeId].Name,
			Status:       statusMap[entry.TimeOffStatusTypeId].Name,
		}
	}

	return res, nil
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

func hasAccess(ta *db.TimeEntryModel, userId int64) bool {
	//TODO if user IsAdmin give access
	return ta.UserId == userId
}*/
