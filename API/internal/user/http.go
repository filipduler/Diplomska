package user

import (
	"api/domain"
	"api/internal"
	userService "api/service/user"
	"api/utils"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/user")

	group.GET("/info", infoHTTP)
	group.GET("/users", usersHTTP)
	group.POST("/impersonate/:userId", impersonateHTTP)
	group.POST("/clear-impersonation", clearImpersonationHTTP)
}

func infoHTTP(c echo.Context) error {
	user, _ := internal.GetUser(c)

	return c.JSON(http.StatusOK, internal.NewResponse(true, userModel{
		UserId:          user.EffectiveUserId(),
		DisplayName:     user.DisplayName,
		Email:           user.Email,
		IsAdmin:         user.IsAdmin,
		IsImpersonating: user.IsImpersonating(),
	}))
}

func usersHTTP(c echo.Context) error {
	user, _ := internal.GetUser(c)
	if !user.IsAdmin {
		return c.JSON(http.StatusUnauthorized, internal.NewEmptyResponse(false))
	}

	userService := userService.UserService{}

	users, err := userService.GetNonAdminUsers()
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	userOptons := lo.Map(users, func(user domain.UserModel, _ int) userOptionModel {
		return userOptionModel{
			UserId: user.Id,
			Name:   user.DisplayName,
			Email:  user.Email,
		}
	})

	return c.JSON(http.StatusOK, internal.NewResponse(true, userOptons))
}

func impersonateHTTP(c echo.Context) error {
	userId, err := utils.ParseStrToInt64(c.Param("userId"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	if !user.IsAdmin {
		return c.JSON(http.StatusUnauthorized, internal.NewEmptyResponse(false))
	}

	userService := userService.UserService{}

	err = userService.SetImpersonatedUser(user, &userId)
	if err != nil {
		c.Logger().Error(err)
	}
	return c.JSON(http.StatusOK, internal.NewEmptyResponse(err == nil))
}

func clearImpersonationHTTP(c echo.Context) error {
	user, _ := internal.GetUser(c)
	if !user.IsAdmin {
		return c.JSON(http.StatusUnauthorized, internal.NewEmptyResponse(false))
	}

	userService := userService.UserService{}

	err := userService.SetImpersonatedUser(user, nil)
	if err != nil {
		c.Logger().Error(err)
	}
	return c.JSON(http.StatusOK, internal.NewEmptyResponse(err == nil))
}
