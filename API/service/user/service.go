package user

import (
	"api/domain"
	"api/utils"
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
	tx := db.Preload("ImpersonatedUser").Find(&user, id)
	return &user, tx.Error
}

func (*UserService) GetUserByEmail(email string) (*domain.UserModel, error) {
	db := utils.GetConnection()

	var user domain.UserModel
	tx := db.Where("Email = ?", email).First(&user)
	return &user, tx.Error
}

func (*UserService) SetImpersonatedUser(user *domain.UserModel, impersonatedUserId *int64) error {
	db := utils.GetConnection()

	if !user.IsAdmin {
		return ErrImpersonationInvalidPermission
	}

	user.ImpersonatedUser = nil
	user.ImpersonatedUserId = impersonatedUserId
	tx := db.Save(user)
	return tx.Error
}
