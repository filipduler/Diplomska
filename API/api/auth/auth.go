package auth

import (
	"api/api"
	"net/http"

	"github.com/labstack/echo/v4"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/auth")

	group.POST("/login", login)
}

func login(c echo.Context) error {
	request := loginRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	token, err := loginUser(request.Email, request.Password)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, token))
}
