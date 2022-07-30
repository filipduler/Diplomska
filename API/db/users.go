package db

type userTable struct{ *store }

type UserModel struct {
	BaseModel
	DisplayName  string `db:"DisplayName"`
	Email        string `db:"Email"`
	PasswordHash []byte `db:"PasswordHash"`
	Active       bool   `db:"Active"`
}

func (store *userTable) GetByEmail(email string) (*UserModel, error) {
	user := UserModel{}
	err := store.DB.Get(&user, "SELECT * FROM User WHERE Email = ?", email)
	return &user, err
}

func (store *userTable) GetById(userId int64) (*UserModel, error) {
	user := UserModel{}
	err := store.DB.Get(&user, "SELECT * FROM User WHERE Id = ?", userId)
	return &user, err
}
