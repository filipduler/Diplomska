package timeentry

import (
	"api/domain"
	"time"
)

type saveTimeEntryRequest struct {
	Id           *int64    `json:"id"`
	StartTimeUtc time.Time `json:"startTimeUtc"`
	EndTimeUtc   time.Time `json:"endTimeUtc"`
	PauseSeconds int       `json:"pauseSeconds"`
	Note         string    `json:"note"`
}

type entriesResponse struct {
	Year    int          `json:"year"`
	Month   int          `json:"month"`
	Entries []entryModel `json:"entries"`
}

type entryModel struct {
	Id              int64     `json:"id"`
	StartTimeUtc    time.Time `json:"startTimeUtc"`
	EndTimeUtc      time.Time `json:"endTimeUtc"`
	TimeDiffSeconds int       `json:"timeDiffSeconds"`
	Note            string    `json:"note"`
	Day             int       `json:"day"`
}

func mapToEntryModel(model *domain.TimeEntryModel) entryModel {
	return entryModel{
		Id:              model.Id,
		StartTimeUtc:    model.StartTimeUtc,
		EndTimeUtc:      model.EndTimeUtc,
		TimeDiffSeconds: int(model.EndTimeUtc.Sub(model.StartTimeUtc).Seconds()) - model.PauseSeconds,
		Note:            model.Note,
		Day:             model.StartTimeUtc.Day(),
	}
}