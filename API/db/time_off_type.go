package db

type timeOffTypeTable struct{ *store }

type TimeOffTypeModel struct {
	Id   int64  `db:"Id"`
	Name string `db:"Name"`
}

func (store *timeOffTypeTable) Get() ([]TimeOffTypeModel, error) {
	te := []TimeOffTypeModel{}
	err := store.DB.Select(&te, "SELECT * FROM TimeOffType")
	if err != nil {
		return nil, err
	}
	return te, nil
}
