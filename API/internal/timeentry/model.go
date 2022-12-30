package timeentry

import (
	"api/domain"
	"api/utils"
	"errors"
	"time"
)

type saveTimeEntryRequest struct {
	Id           *int64    `json:"id"`
	StartTimeUtc time.Time `json:"startTimeUtc"`
	EndTimeUtc   time.Time `json:"endTimeUtc"`
	PauseSeconds int       `json:"pauseSeconds"`
	Note         string    `json:"note"`
}

func (m *saveTimeEntryRequest) validate(dailyHours float64) error {
	//min date is three days back
	utcNow := time.Now().UTC()
	minDate := utcNow.Add(-time.Hour * 24 * 3)

	if m.PauseSeconds < 0 {
		m.PauseSeconds = 0
	}

	m.Note = utils.Substring(m.Note, 0, 512)

	//cannot enter time entries later than 3 days ago
	if m.StartTimeUtc.Before(minDate) {
		return errors.New("cannot enter entries later than 3 days ago")
	}

	//end date cannot be sooner than end date
	if m.EndTimeUtc.Equal(m.StartTimeUtc) || m.EndTimeUtc.Before(m.StartTimeUtc) {
		return errors.New("end time has to be larger than start time")
	}

	diffHours := m.EndTimeUtc.Sub(m.StartTimeUtc).Hours()
	pauseHours := time.Duration(float64(m.PauseSeconds) * float64(time.Second)).Hours()

	if pauseHours >= diffHours {
		return errors.New("pause cannot be larger than work hours")
	}

	//effective hours cannot be larger than 24hours
	effectiveHours := diffHours - pauseHours
	if effectiveHours > 24 {
		return errors.New("single time entry cannot be larger than 24hours")
	}

	//aggregate sum cannot be larger than 24 hours per day
	if dailyHours+effectiveHours > 24 {
		return errors.New("aggregate hours for the specific day cannot exceed 24hours")
	}

	return nil
}

type entriesResponse struct {
	Year    int          `json:"year"`
	Month   int          `json:"month"`
	Entries []entryModel `json:"entries"`
}

type dailyHoursModel struct {
	Day         int  `json:"day"`
	IsCompleted bool `json:"isCompleted"`
}

type timeEntryStatsReponse struct {
	TodayMinutes     int64 `json:"todayMinutes"`
	ThisMonthMinutes int64 `json:"thisMonthMinutes"`
}

type entryModel struct {
	Id              int64     `json:"id"`
	StartTimeUtc    time.Time `json:"startTimeUtc"`
	EndTimeUtc      time.Time `json:"endTimeUtc"`
	PauseSeconds    int       `json:"pauseSeconds"`
	TimeDiffSeconds int       `json:"timeDiffSeconds"`
	Note            string    `json:"note"`
	Day             int       `json:"day"`
}

func mapToEntryModel(model *domain.TimeEntryModel) entryModel {
	return entryModel{
		Id:              model.Id,
		StartTimeUtc:    model.StartTimeUtc,
		EndTimeUtc:      model.EndTimeUtc,
		PauseSeconds:    model.PauseSeconds,
		TimeDiffSeconds: int(model.EndTimeUtc.Sub(model.StartTimeUtc).Seconds()) - model.PauseSeconds,
		Note:            model.Note,
		Day:             model.StartTimeUtc.Day(),
	}
}
