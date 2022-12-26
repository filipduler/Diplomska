package user

import (
	"api/internal"
	"net/http"

	"github.com/labstack/echo/v4"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/user")

	group.GET("/info", infoHTTP)
}

func infoHTTP(c echo.Context) error {
	user, _ := internal.GetUser(c)

	return c.JSON(http.StatusOK, internal.NewResponse(true, userModel{
		UserId:          user.EffectiveUserId(),
		DisplayName:     user.DisplayName,
		Email:           user.Email,
		IsAdmin:         user.IsAdmin,
		IsImpersonating: user.ImpersonatedUserId != nil,
	}))
}
