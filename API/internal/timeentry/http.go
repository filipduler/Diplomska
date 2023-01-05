package timeentry

import (
	"api/domain"
	"api/internal"
	"api/service/timeentry"
	"api/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
)

func NewHTTP(r *echo.Group) {
	group := r.Group("/time-entry")

	group.GET("/stats", statsHTTP)
	group.POST("/save", saveEntryHTTP)
	group.GET("/:year/:month", monthlyEntriesHTTP)
	group.GET("/:id", entryHTTP)
	group.DELETE("/:id", deleteEntryHTTP)
	group.GET("/:id/history", entryHistoryHTTP)
	group.POST("/changes", entryChangesHTTP)
	group.GET("/days-completed/:year/:month", daysCompletedHTTP)
}

func statsHTTP(c echo.Context) error {
	res := timeEntryStatsReponse{}

	user, _ := internal.GetUser(c)
	timeEntryService := timeentry.TimeEntryService{}

	now := time.Now().UTC()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	prevMonth := monthStart.AddDate(0, -1, 0)

	entries, err := timeEntryService.GetEntriesFrom(prevMonth, user.EffectiveUserId())
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	getTimeEntrySum := func(entries []domain.TimeEntryModel, from time.Time, to time.Time) int64 {
		filteredEntries := lo.Filter(entries, func(entry domain.TimeEntryModel, _ int) bool {
			return entry.StartTimeUtc.After(from) && entry.StartTimeUtc.Before(to)
		})

		return int64(aggregateEffectiveDuration(filteredEntries).Minutes())
	}

	//this month
	res.ThisMonthMinutes = getTimeEntrySum(entries, monthStart, utils.EndOfMonth(monthStart))

	//this day
	dayStart := utils.DayStart(now)
	dayEnd := utils.DayEnd(now)
	res.TodayMinutes = getTimeEntrySum(entries, dayStart, dayEnd)

	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}

func entryHTTP(c echo.Context) error {
	timeEntryId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	timeEntryService := timeentry.TimeEntryService{}

	entry, err := timeEntryService.GetValidTimeEntry(timeEntryId, user.EffectiveUserId())
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	entryResponse := mapToEntryModel(entry)

	return c.JSON(http.StatusOK, internal.NewResponse(err == nil, entryResponse))
}

func monthlyEntriesHTTP(c echo.Context) error {
	month, err := strconv.Atoi(c.Param("month"))
	if err != nil {
		return err
	}

	year, err := strconv.Atoi(c.Param("year"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	timeEntryService := timeentry.TimeEntryService{}

	entries, err := timeEntryService.GetEntries(month, year, user.EffectiveUserId())
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	res := entriesResponse{
		Year:    year,
		Month:   month,
		Entries: []entryModel{},
	}

	for _, element := range entries {
		res.Entries = append(res.Entries, mapToEntryModel(&element))
	}

	return c.JSON(http.StatusOK, internal.NewResponse(err == nil, res))
}

func saveEntryHTTP(c echo.Context) error {
	request := saveTimeEntryRequest{}
	if err := c.Bind(&request); err != nil {
		return err
	}
	user, _ := internal.GetUser(c)
	timeEntryService := timeentry.TimeEntryService{}

	//get daily hours across all entries
	nowUtc := time.Now().UTC()
	dayStart := utils.DayStart(nowUtc)
	dayEnd := utils.DayEnd(nowUtc)
	dailyEntries, err := timeEntryService.GetEntriesBetween(dayStart, dayEnd, user.Id)
	if err != nil {
		return internal.NewHTTPError(c, err)
	}
	dailyHours := aggregateEffectiveDuration(dailyEntries).Hours()

	//validate model
	if err := request.validate(dailyHours); err != nil {
		return internal.NewHTTPError(c, err)
	}

	id, err := timeEntryService.SaveTimeEntry(
		request.Id,
		request.StartTimeUtc,
		request.EndTimeUtc,
		request.PauseSeconds,
		request.Note,
		user.DailyWorkHours,
		user.EffectiveUserId(),
		user.Id)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, internal.NewResponse(err == nil, id))
}

func deleteEntryHTTP(c echo.Context) error {
	timeEntryId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)

	timeEntryService := timeentry.TimeEntryService{}

	err = timeEntryService.DeleteTimeEntry(timeEntryId, user.EffectiveUserId(), user.Id)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, internal.NewEmptyResponse(err == nil))
}

func entryHistoryHTTP(c echo.Context) error {
	timeEntryId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)

	timeEntryService := timeentry.TimeEntryService{}

	res, err := timeEntryService.TimeEntryHistory(timeEntryId, user.EffectiveUserId())
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
	timeEntryService := timeentry.TimeEntryService{}

	timeEntryLogs, err := timeEntryService.GetTimeEntryLogs(
		user.EffectiveUserId(),
		utils.DayStart(request.From),
		utils.DayEnd(request.To))
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	var res []internal.ChangeModel
	for _, log := range timeEntryLogs {
		res = append(res, internal.ChangeModel{
			Id:              log.TimeEntryId,
			ModifierName:    log.ModifierUser.DisplayName,
			ModifierUserId:  log.ModifierUserId,
			LogType:         log.LogTypeId,
			LastUpdateOnUtc: log.InsertedOnUtc,
		})
	}

	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}

func daysCompletedHTTP(c echo.Context) error {
	month, err := strconv.Atoi(c.Param("month"))
	if err != nil {
		return err
	}

	year, err := strconv.Atoi(c.Param("year"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	timeEntryService := timeentry.TimeEntryService{}

	date := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	startOfMonth := utils.BeginningOfMonth(date)
	endOfMonth := utils.EndOfMonth(date)

	entries, err := timeEntryService.GetEntriesBetween(startOfMonth, endOfMonth, user.EffectiveUserId())
	if err != nil {
		return internal.NewHTTPError(c, err)
	}

	groupedEntries := lo.GroupBy(entries, func(entry domain.TimeEntryModel) int {
		return entry.StartTimeUtc.Day()
	})

	var res []dailyHoursModel
	for _, dailyEntries := range groupedEntries {
		firstEntry := dailyEntries[0]
		dailyHours := lo.SumBy(dailyEntries, func(entry domain.TimeEntryModel) float64 {
			return entry.EffectiveSeconds().Hours()
		})

		res = append(res, dailyHoursModel{
			Day:         firstEntry.StartTimeUtc.Day(),
			IsCompleted: dailyHours >= firstEntry.DailyWorkHours,
		})
	}

	return c.JSON(http.StatusOK, internal.NewResponse(true, res))
}
