package entry

import "time"

type newEntryRequest struct {
	StartTimeUtc time.Time `json:"startTimeUtc"`
	EndTimeUtc   time.Time `json:"endTimeUtc"`
	Note         string    `json:"note"`
}

type updateEntryRequest struct {
	StartTimeUtc time.Time `json:"startTimeUtc"`
	EndTimeUtc   time.Time `json:"endTimeUtc"`
	Note         string    `json:"note"`
}

type entriesResponse struct {
	Year    int          `json:"year"`
	Month   int          `json:"month"`
	Entries []entryModel `json:"entries"`
}

type entryModel struct {
	Id            int64     `json:"id"`
	StartTimeUtc  time.Time `json:"startTimeUtc"`
	EndTimeUtc    time.Time `json:"endTimeUtc"`
	TimeDiffHours float64   `json:"timeDiffHours"`
	Note          string    `json:"note"`
	Day           int       `json:"day"`
}

type timerModel struct {
	Id           int64     `json:"id"`
	StartTimeUtc time.Time `json:"startTimeUtc"`
}
