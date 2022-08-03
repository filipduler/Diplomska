package history

import (
	"api/api"
	"net/http"

	"github.com/labstack/echo/v4"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/history")

	group.GET("", httpHistory)
}

func httpHistory(c echo.Context) error {
	request := historyRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	res, err := getHistory(&request, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}
