package api

import (
	"api/db"
	"errors"

	"github.com/labstack/echo/v4"
)

const (
	UserKey = "User"
)

var (
	errUserNotFound = errors.New("user not initialized in echo context")
)

func GetUser(c echo.Context) (*db.UserModel, error) {
	user := c.Get(UserKey)
	if user != nil {
		return user.(*db.UserModel), nil
	}
	return nil, errUserNotFound
}
