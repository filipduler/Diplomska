package entry

import (
	"api/api"
	"api/utils"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/entry")

	group.GET("/:id", httpEntry)
	group.GET("/:year/:month", httpMonthlyEntries)
	group.POST("/save", httpSaveEntry)
	group.DELETE("/:id", httpDeleteEntry)
	group.GET("/:id/history", httpEntryHistory)
	group.GET("/check-timer", httpCheckTimerEntry)
	group.POST("/start-timer", httpStartTimerEntry)
	group.POST("/stop-timer/:id", httpStopTimerEntry)
	group.POST("/cancel-timer", httpCancelTimerEntry)
}
func httpEntry(c echo.Context) error {
	timeEntryId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	res, err := getEntry(timeEntryId, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}

func httpMonthlyEntries(c echo.Context) error {
	month, err := strconv.Atoi(c.Param("month"))
	if err != nil {
		return err
	}

	year, err := strconv.Atoi(c.Param("year"))
	if err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	res, err := getEntries(month, year, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}

func httpSaveEntry(c echo.Context) error {
	request := saveEntryRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	id, err := saveEntry(&request, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, id))
}

func httpDeleteEntry(c echo.Context) error {
	timeEntryId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	err = deleteEntry(timeEntryId, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewEmptyResponse(err == nil))
}

func httpStartTimerEntry(c echo.Context) error {
	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	timer, err := startTimerEntry(user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, timer))
}

func httpStopTimerEntry(c echo.Context) error {
	timeEntryId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	err = stopTimerEntry(timeEntryId, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewEmptyResponse(err == nil))
}

func httpCancelTimerEntry(c echo.Context) error {
	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	err = cancelTimerEntry(user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewEmptyResponse(err == nil))
}

func httpCheckTimerEntry(c echo.Context) error {
	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	timer, err := checkTimerEntry(user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, timer))
}

func httpEntryHistory(c echo.Context) error {
	timeEntryId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, err := api.GetUser(c)
	if err != nil {
		c.Logger().Error(err)
	}

	res, err := entryHistory(timeEntryId, user)
	c.Logger().Print(res)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}
