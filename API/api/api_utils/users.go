package apiutils

import (
	"api/db"

	"github.com/samber/lo"
)

func GetUserMap(userIds []int64, dbStore *db.DBStore) (map[int64]db.UserModel, error) {
	if len(userIds) == 0 {
		return map[int64]db.UserModel{}, nil
	}

	users, err := dbStore.User.GetByIds(userIds)
	if err != nil {
		return nil, err
	}

	return lo.KeyBy(users, func(user db.UserModel) int64 { return user.Id }), nil
}
