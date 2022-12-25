package user

import (
	"api/domain"
	"api/utils"
)

type UserService struct{}

func (s *UserService) GetUserById(id int64) (*domain.UserModel, error) {
	db := utils.GetConnection()

	var user domain.UserModel
	tx := db.First(&user, id)
	return &user, tx.Error
}

func (s *UserService) GetUserByEmail(email string) (*domain.UserModel, error) {
	db := utils.GetConnection()

	var user domain.UserModel
	tx := db.Where("email = ?", email).First(&user)
	return &user, tx.Error
}
