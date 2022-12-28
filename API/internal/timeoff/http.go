package timeoff

import (
	"api/domain"
	"api/internal"
	"api/service/timeoff"
	"api/utils"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/time-off")

	group.GET("", entriesHTTP)
	group.GET("/status/:status", entriesByStatusHTTP)
	group.GET("/status-types", typesHTTP)
	group.PUT("/:id/close-request", closeRequestHTTP)
	group.POST("/save", saveHTTP)
	group.GET("/:id", entryHTTP)
	group.GET("/:id/history", entryHistoryHTTP)
	group.GET("/changes", entryChangesHTTP)
	group.GET("/days-off/:year/:month", daysOffHTTP)
}

func entriesHTTP(c echo.Context) error {
	user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}

	entries, err := timeOffService.GetTimeOffEntriesByUser(user.EffectiveUserId())
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	res := []timeOffModel{}
	for _, entry := range entries {
		res = append(res, mapTimeOffEntry(&entry))
	}

	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}

func entriesByStatusHTTP(c echo.Context) error {
	statusRaw, err := utils.ParseStrToInt64(c.Param("status"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	if !user.IsAdmin {
		return c.JSON(http.StatusUnauthorized, internal.NewEmptyResponse(false))
	}

	timeOffService := timeoff.TimeOffService{}

	entries, err := timeOffService.GetTimeOffEntriesByStatus(domain.TimeOffStatus(statusRaw))
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	res := []timeOffModel{}
	for _, entry := range entries {
		res = append(res, mapTimeOffEntry(&entry))
	}

	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}

func entryHTTP(c echo.Context) error {
	timeOffId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	//user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}

	entry, err := timeOffService.GetTimeOffEntry(timeOffId)
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	//TODO validate if user has access..

	res := timeOffDetailsModel{
		timeOffModel:  mapTimeOffEntry(entry),
		IsCancellable: entry.TimeOffStatusTypeId == int64(domain.PendingTimeOffStatus),
		IsFinished:    entry.TimeOffStatusTypeId != int64(domain.PendingTimeOffStatus),
	}

	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}

func typesHTTP(c echo.Context) error {
	timeOffService := timeoff.TimeOffService{}
	types, err := timeOffService.GetStatusTypes()
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	res := lo.Map(types, func(t domain.TimeOffTypeModel, _ int) typeModel {
		return typeModel{
			Id:   t.Id,
			Name: t.Name,
		}
	})

	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}

func closeRequestHTTP(c echo.Context) error {
	timeOffId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}

	err = timeOffService.SetTimeOffStatus(timeOffId, user.Id, domain.CanceledTimeOffStatus)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, internal.NewEmptyResponse(err == nil))
}

func saveHTTP(c echo.Context) error {
	request := saveRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}

	timeOffId, err := timeOffService.SaveTimeOffEntry(
		request.Id,
		request.StartTimeUtc,
		request.EndTimeUtc,
		request.Note,
		request.TypeId,
		user.Id)

	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, internal.NewResponse(err == nil, timeOffId))
}

func entryHistoryHTTP(c echo.Context) error {
	timeOffId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}
	res, err := timeOffService.TimeOffHistory(timeOffId, user.EffectiveUserId())
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, internal.NewResponse(err == nil, res))
}

func entryChangesHTTP(c echo.Context) error {
	request := internal.ChangeRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	timeEntryService := timeoff.TimeOffService{}

	timeEntryLogs, err := timeEntryService.GetTimeOffLogs(user.EffectiveUserId(), request.From, request.To)
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	var res []internal.ChangeModel

	for _, log := range timeEntryLogs {
		res = append(res, internal.ChangeModel{
			Id:              log.TimeOffId,
			StartTimeUtc:    log.StartDate,
			EndTimeUtc:      log.EndDate,
			LogType:         log.LogTypeId,
			LastUpdateOnUtc: log.InsertedOnUtc,
		})
	}

	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}

func daysOffHTTP(c echo.Context) error {
	/*month, err := strconv.Atoi(c.Param("month"))
	if err != nil {
		return err
	}

	year, err := strconv.Atoi(c.Param("year"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	timeEntryService := timeoff.TimeOffService{}

	date := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	startOfMonth := utils.BeginningOfMonth(date)
	endOfMonth := utils.EndOfMonth(date)

	timeOffEntries, err := timeEntryService.GetTimeOffEntriesBetween(startOfMonth, endOfMonth, user.EffectiveUserId(), domain.AcceptedTimeOffStatus)
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	var days []int
	for _, entry := range timeOffEntries {
		for day := entry.Day(); day <= entry.Day(); day++ {
			days = append(days, day)
		}
	}

	lo.UniqBy(timeOffEntries, func(entry domain.TimeOffModel) int {
		return entry.start
	})

	var res []int

	for day := startOfMonth.Day(); day <= endOfMonth.Day(); day++ {

	}*/
	var res []int
	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}
