package timeoff

import (
	"api/domain"
	"api/internal"
	"api/service/daysoff"
	"api/service/timeoff"
	userService "api/service/user"
	"api/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/time-off")

	group.GET("", entriesHTTP)
	group.GET("/status/:status", entriesByStatusHTTP)
	group.GET("/status-types", typesHTTP)
	group.PUT("/update-status", updateStatusHTTP)
	group.POST("/save", saveHTTP)
	group.GET("/:id", entryHTTP)
	group.GET("/:id/history", entryHistoryHTTP)
	group.POST("/changes", entryChangesHTTP)
	group.GET("/days-off/:year/:month", daysOffHTTP)
	group.GET("/days-off-left", daysOffLeftHTTP)
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

	return c.JSON(http.StatusOK, internal.NewResponse(true, mapTimeOffEntry(entry)))
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

func updateStatusHTTP(c echo.Context) error {
	request := updateStatusRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}

	//validate status value is valid
	status := domain.TimeOffStatus(request.Status)
	if !status.IsValid() {
		return internal.NewHTTPError(c, ErrInvalidTimeOffStatus)
	}

	user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}

	timeOffEntry, err := timeOffService.GetTimeOffEntry(request.Id)
	if err != nil {
		return internal.NewHTTPError(c, err)
	}
	currentStatus := domain.TimeOffStatus(timeOffEntry.TimeOffStatusTypeId)

	//validate the status is in pending
	if currentStatus != domain.PendingTimeOffStatus {
		return internal.NewHTTPError(c, ErrStatusAlreadyCompleted)
	}

	//admin can only change it to accepted OR rejected
	if user.IsAdmin && !(status == domain.AcceptedTimeOffStatus || status == domain.RejectedTimeOffStatus) {
		return internal.NewHTTPError(c, ErrStatusInvalidRequestedStatus)
	}

	//non admin can only change it to cancelled
	if !user.IsAdmin && status != domain.CanceledTimeOffStatus {
		return internal.NewHTTPError(c, ErrStatusInvalidRequestedStatus)
	}

	err = timeOffService.SetTimeOffStatus(request.Id, user.Id, status)
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
		request.StartDate,
		request.EndDate,
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

	timeEntryLogs, err := timeEntryService.GetTimeOffLogs(
		user.EffectiveUserId(),
		utils.DayStart(request.From),
		utils.DayEnd(request.To))
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	//get all users who changed the logs
	userIds := lo.Uniq(lo.Map(timeEntryLogs, func(log domain.TimeOffLogModel, _ int) int64 { return log.UserId }))

	userService := userService.UserService{}
	userMap, err := userService.GetUserMap(userIds)
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	var res []internal.ChangeModel
	for _, log := range timeEntryLogs {
		modifiedByOwner := log.UserId == user.Id

		//load modifier user
		curUser := userMap[log.UserId]

		res = append(res, internal.ChangeModel{
			Id:              log.TimeOffId,
			ModifierName:    curUser.DisplayName,
			ModifiedByOwner: modifiedByOwner,
			LogType:         log.LogTypeId,
			LastUpdateOnUtc: log.InsertedOnUtc,
		})
	}

	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}

func daysOffHTTP(c echo.Context) error {
	month, err := strconv.Atoi(c.Param("month"))
	if err != nil {
		return err
	}

	year, err := strconv.Atoi(c.Param("year"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)

	date := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	startOfMonth := utils.BeginningOfMonth(date)
	endOfMonth := utils.EndOfMonth(date)

	//get days off from the time requests
	days, err := getTimeOffDaysBetween(startOfMonth, endOfMonth, user.EffectiveUserId())
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	daysOffService := daysoff.DaysOffService{}
	daysOff, err := daysOffService.GetDaysOff(startOfMonth, endOfMonth)
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	for _, dayOff := range daysOff {
		if dayOff.Date.After(startOfMonth) && dayOff.Date.Before(endOfMonth) {
			days = append(days, dayOff.Date.Day())
		}
	}

	return c.JSON(http.StatusOK, internal.NewResponse(true, lo.Uniq(days)))
}

func daysOffLeftHTTP(c echo.Context) error {
	user, _ := internal.GetUser(c)

	date := time.Now()
	startOfYear := utils.BeginningOfYear(date)
	endOfYear := utils.EndOfYear(date)

	//get days off from the time requests
	days, err := getTimeOffDaysBetween(startOfYear, endOfYear, user.EffectiveUserId())
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	daysLeft := user.EffectiveVacationHours() - len(lo.Uniq(days))

	return c.JSON(http.StatusOK, internal.NewResponse(true, daysLeft))
}
