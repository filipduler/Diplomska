package db

type UserTable struct{ *store }

type UserModel struct {
	BaseModel
	DisplayName  string `db:"DisplayName"`
	Email        string `db:"Email"`
	PasswordHash []byte `db:"PasswordHash"`
	Active       bool   `db:"Active"`
}

func (store *UserTable) GetByEmail(email string) (*UserModel, error) {
	user := UserModel{}
	err := store.DB.Get(&user, "SELECT * FROM User WHERE Email = ?", email)
	return &user, err
}
