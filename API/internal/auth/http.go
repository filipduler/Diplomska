package auth

import (
	"api/internal"
	"api/service/auth"
	"net/http"

	"github.com/labstack/echo/v4"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/auth")

	group.POST("/login", loginHTTP)
	group.POST("/refresh", refreshHTTP)
}

func loginHTTP(c echo.Context) error {
	request := loginRequest{}

	if err := c.Bind(&request); err != nil {
		return err
	}

	authService := auth.AuthService{}
	loginDTO, err := authService.LoginUser(request.Email, request.Password)
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusOK, internal.NewEmptyResponse(false))
	}

	return c.JSON(http.StatusOK, internal.NewResponse(err == nil, loginResponse{
		tokenModel{loginDTO.Token.Token, loginDTO.Token.Expiry},
		tokenModel{loginDTO.Refresh.Token, loginDTO.Refresh.Expiry},
	}))
}

func refreshHTTP(c echo.Context) error {
	request := refreshRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	authService := auth.AuthService{}
	loginToken, err := authService.RefreshUser(request.Refresh)
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusOK, internal.NewEmptyResponse(false))
	}

	return c.JSON(http.StatusOK, internal.NewResponse(err == nil, refreshResponse{
		tokenModel{loginToken.Token, loginToken.Expiry},
	}))
}
