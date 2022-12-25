package user

import (
	"api/domain"
	"api/utils"

	"github.com/samber/lo"
)

type UserService struct{}

func (*UserService) GetUserById(id int64) (*domain.UserModel, error) {
	db := utils.GetConnection()

	var user domain.UserModel
	tx := db.First(&user, id)
	return &user, tx.Error
}

func (*UserService) GetUserByEmail(email string) (*domain.UserModel, error) {
	db := utils.GetConnection()

	var user domain.UserModel
	tx := db.Where("email = ?", email).First(&user)
	return &user, tx.Error
}

func (*UserService) GetUserMap(userIds []int64) (map[int64]domain.UserModel, error) {
	db := utils.GetConnection()

	if len(userIds) == 0 {
		return map[int64]domain.UserModel{}, nil
	}

	var users []domain.UserModel
	tx := db.Find(&users, userIds)
	if tx.Error != nil {
		return nil, tx.Error
	}

	return lo.KeyBy(users, func(user domain.UserModel) int64 { return user.Id }), nil
}
