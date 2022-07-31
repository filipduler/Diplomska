package db

import (
	"strconv"
	"strings"

	"github.com/samber/lo"
)

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

func (store *userTable) GetByIds(userIds []int64) ([]UserModel, error) {
	user := []UserModel{}
	ids := lo.Map(userIds, func(id int64, _ int) string { return strconv.FormatInt(id, 10) })
	err := store.DB.Select(&user, "SELECT * FROM User WHERE Id IN (?)", strings.Join(ids, ","))
	return user, err
}
