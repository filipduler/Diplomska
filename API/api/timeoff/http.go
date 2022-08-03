package timeoff

import (
	"api/api"
	"api/utils"
	"net/http"

	"github.com/labstack/echo/v4"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/time-off")

	group.GET("", httpEntries)
	group.GET("/:id", httpEntry)
	group.PUT("/:id/close-request", httpCloseRequest)
	group.GET("/:id/history", httpEntryHistory)
	group.POST("/save", httpSave)
	group.GET("/types", httpTypes)
}

func httpEntries(c echo.Context) error {
	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	res, err := getEntries(user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}

func httpEntry(c echo.Context) error {
	timeOffId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	res, err := getEntry(timeOffId, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}

func httpTypes(c echo.Context) error {
	res, err := getTypes()
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}

func httpCloseRequest(c echo.Context) error {
	timeOffId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	err = closeEntryStatus(timeOffId, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewEmptyResponse(err == nil))
}

func httpSave(c echo.Context) error {
	request := saveRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	timeOffId, err := saveEntry(&request, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, timeOffId))
}

func httpEntryHistory(c echo.Context) error {
	timeOffId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	res, err := entryHistory(timeOffId, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}
