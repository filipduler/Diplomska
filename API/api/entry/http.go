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
	group.POST("", httpNewEntry)
	group.PUT("/:id", httpUpdateEntry)
	group.DELETE("/:id", httpDeleteEntry)
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

	res, err := getEntries(month, year, 1)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}

func httpNewEntry(c echo.Context) error {
	request := newEntryRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	err := newEntry(request.StartTimeUtc, request.EndTimeUtc, request.Note, 1)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewEmptyResponse(err == nil))
}

func httpUpdateEntry(c echo.Context) error {
	timeEntryId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	request := updateEntryRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	err = updateEntry(timeEntryId, request.StartTimeUtc, request.EndTimeUtc, request.Note, 1)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewEmptyResponse(err == nil))
}

func httpDeleteEntry(c echo.Context) error {
	timeEntryId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	err = deleteEntry(timeEntryId, 1)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewEmptyResponse(err == nil))
}

func httpStartTimerEntry(c echo.Context) error {
	timer, err := startTimerEntry(1)
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

	err = stopTimerEntry(timeEntryId, 1)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewEmptyResponse(err == nil))
}

func httpCancelTimerEntry(c echo.Context) error {
	err := cancelTimerEntry(1)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewEmptyResponse(err == nil))
}

func httpCheckTimerEntry(c echo.Context) error {
	timer, err := checkTimerEntry(1)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, timer))
}
