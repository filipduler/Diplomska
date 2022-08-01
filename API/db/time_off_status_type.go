package db

type timeOffStatusTypeTable struct{ *store }

type TimeOffStatusTypeModel struct {
	Id   int64  `db:"Id"`
	Name string `db:"Name"`
}

func (store *timeOffStatusTypeTable) Get() ([]TimeOffStatusTypeModel, error) {
	te := []TimeOffStatusTypeModel{}
	err := store.db.Select(&te, "SELECT * FROM TimeOffStatusType")
	if err != nil {
		return nil, err
	}
	return te, nil
}
