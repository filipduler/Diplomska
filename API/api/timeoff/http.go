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

/*func httpUpdateEntry(c echo.Context) error {
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
}*/
