package timeoff

import (
	"api/domain"
	"time"
)

type saveRequest struct {
	Id           *int64    `json:"id"`
	StartTimeUtc time.Time `json:"startTimeUtc"`
	EndTimeUtc   time.Time `json:"endTimeUtc"`
	Note         string    `json:"note"`
	TypeId       int64     `json:"typeId"`
}

type timeOffModel struct {
	Id        int64     `json:"id"`
	StartDate time.Time `json:"startDate"`
	EndDate   time.Time `json:"endDate"`
	Note      string    `json:"note"`
	Type      typeModel `json:"type"`
	Status    int64     `json:"status"`
}

func mapTimeOffEntry(entry *domain.TimeOffModel) timeOffModel {
	return timeOffModel{
		Id:        entry.Id,
		StartDate: entry.StartDate,
		EndDate:   entry.EndDate,
		Note:      entry.Note,
		Type: typeModel{
			Id:   entry.TimeOffType.Id,
			Name: entry.TimeOffType.Name,
		},
		Status: entry.TimeOffStatusTypeId,
	}
}

type typeModel struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

type timeOffDetailsModel struct {
	timeOffModel
	IsCancellable bool `json:"isCancellable"`
	IsFinished    bool `json:"isFinished"`
}
