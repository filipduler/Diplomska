package timeentry

import (
	"api/api"
	"api/internal"
	"api/service/timeentry"
	"net/http"

	"github.com/labstack/echo/v4"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/time-entry")

	group.POST("/save", httpSaveEntry)
	/*group.GET("/:id", httpEntry)
	group.GET("/:year/:month", httpMonthlyEntries)

	group.DELETE("/:id", httpDeleteEntry)
	group.GET("/:id/history", httpEntryHistory)*/
}

/*func httpEntry(c echo.Context) error {
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
}*/

func httpSaveEntry(c echo.Context) error {
	request := saveTimeEntryRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	user, _ := internal.GetUser(c)

	timeEntryService := timeentry.TimeEntryService{}
	id, err := timeEntryService.SaveTimeEntry(
		request.Id,
		request.StartTimeUtc,
		request.EndTimeUtc,
		request.PauseSeconds,
		request.Note,
		user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, id))
}

/*func httpDeleteEntry(c echo.Context) error {
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
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}
*/
