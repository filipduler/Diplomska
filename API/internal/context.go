package internal

import (
	"api/domain"
	"errors"

	"github.com/labstack/echo/v4"
)

const (
	UserKey = "User"
)

var (
	errUserNotFound = errors.New("user not initialized in echo context")
)

func GetUser(c echo.Context) (*domain.UserModel, error) {
	user := c.Get(UserKey)
	if user != nil {
		return user.(*domain.UserModel), nil
	}
	return nil, errUserNotFound
}
