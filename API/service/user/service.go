package user

import (
	"api/domain"
	"api/utils"

	"github.com/samber/lo"
)

type UserService struct{}

func (*UserService) GetNonAdminUsers() ([]domain.UserModel, error) {
	db := utils.GetConnection()

	var users []domain.UserModel
	tx := db.Where("IsAdmin = false").Find(&users)
	return users, tx.Error
}

func (*UserService) GetUserById(id int64) (*domain.UserModel, error) {
	db := utils.GetConnection()

	var user domain.UserModel
	tx := db.Find(&user, id)
	return &user, tx.Error
}

func (*UserService) GetUserByEmail(email string) (*domain.UserModel, error) {
	db := utils.GetConnection()

	var user domain.UserModel
	tx := db.Where("Email = ?", email).First(&user)
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

func (*UserService) SetImpersonatedUser(user *domain.UserModel, impersonatedUserId *int64) error {
	db := utils.GetConnection()

	if !user.IsAdmin {
		return ErrImpersonationInvalidPermission
	}

	user.ImpersonatedUserId = impersonatedUserId
	tx := db.Save(user)
	return tx.Error
}
