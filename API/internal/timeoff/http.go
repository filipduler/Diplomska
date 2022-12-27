package timeoff

import (
	"api/api"
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

	group.GET("", httpEntries)
	group.GET("/status/:status", httpEntriesByStatus)
	group.GET("/status-types", httpTypes)
	group.PUT("/:id/close-request", httpCloseRequest)
	group.POST("/save", httpSave)
	group.GET("/:id", httpEntry)
	group.GET("/:id/history", httpEntryHistory)
}

func httpEntries(c echo.Context) error {
	user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}

	entries, err := timeOffService.GetTimeOffEntriesByUser(user)
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusOK, api.NewEmptyResponse(false))
	}

	res := []timeOffModel{}
	for _, entry := range entries {
		res = append(res, timeOffModel{
			Id:           entry.Id,
			StartTimeUtc: entry.StartTimeUtc,
			EndTimeUtc:   entry.EndTimeUtc,
			Note:         entry.Note,
			Type: typeModel{
				Id:   entry.TimeOffType.Id,
				Name: entry.TimeOffType.Name,
			},
			Status: entry.TimeOffStatusTypeId,
		})
	}

	return c.JSON(http.StatusOK, api.NewResponse(true, res))
}

func httpEntriesByStatus(c echo.Context) error {
	statusRaw, err := utils.ParseStrToInt64(c.Param("status"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	if !user.IsAdmin {
		return c.JSON(http.StatusUnauthorized, api.NewEmptyResponse(false))
	}

	timeOffService := timeoff.TimeOffService{}

	entries, err := timeOffService.GetTimeOffEntriesByStatus(domain.TimeOffStatus(statusRaw))
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusOK, api.NewEmptyResponse(false))
	}

	res := []timeOffModel{}
	for _, entry := range entries {
		res = append(res, timeOffModel{
			Id:           entry.Id,
			StartTimeUtc: entry.StartTimeUtc,
			EndTimeUtc:   entry.EndTimeUtc,
			Note:         entry.Note,
			Type: typeModel{
				Id:   entry.TimeOffType.Id,
				Name: entry.TimeOffType.Name,
			},
			Status: entry.TimeOffStatusTypeId,
		})
	}

	return c.JSON(http.StatusOK, api.NewResponse(true, res))
}

func httpEntry(c echo.Context) error {
	timeOffId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	//user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}

	entry, err := timeOffService.GetTimeOffEntry(timeOffId)
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusOK, api.NewEmptyResponse(false))
	}

	//TODO validate if user has access..

	res := timeOffDetailsModel{
		timeOffModel: timeOffModel{
			Id:           entry.Id,
			StartTimeUtc: entry.StartTimeUtc,
			EndTimeUtc:   entry.EndTimeUtc,
			Note:         entry.Note,
			Type: typeModel{
				Id:   entry.TimeOffType.Id,
				Name: entry.TimeOffType.Name,
			},
			Status: entry.TimeOffStatusTypeId,
		},
		IsCancellable: entry.TimeOffStatusTypeId == int64(domain.PendingTimeOffStatus),
		IsFinished:    entry.TimeOffStatusTypeId != int64(domain.PendingTimeOffStatus),
	}

	return c.JSON(http.StatusOK, api.NewResponse(true, res))
}

func httpTypes(c echo.Context) error {
	timeOffService := timeoff.TimeOffService{}
	types, err := timeOffService.GetStatusTypes()
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusOK, api.NewEmptyResponse(false))
	}

	res := lo.Map(types, func(t domain.TimeOffTypeModel, _ int) typeModel {
		return typeModel{
			Id:   t.Id,
			Name: t.Name,
		}
	})

	return c.JSON(http.StatusOK, api.NewResponse(true, res))
}

func httpCloseRequest(c echo.Context) error {
	timeOffId, err := utils.ParseStrToInt64(c.Param("id"))
	if err != nil {
		return err
	}

	user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}

	err = timeOffService.SetTimeOffStatus(timeOffId, user, domain.CanceledTimeOffStatus)
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

	user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}

	timeOffId, err := timeOffService.SaveTimeOffEntry(
		request.Id,
		request.StartTimeUtc,
		request.EndTimeUtc,
		request.Note,
		request.TypeId,
		user)

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

	user, _ := internal.GetUser(c)
	timeOffService := timeoff.TimeOffService{}
	res, err := timeOffService.TimeOffHistory(timeOffId, user)
	if err != nil {
		c.Logger().Error(err)
	}

	return c.JSON(http.StatusOK, api.NewResponse(err == nil, res))
}
