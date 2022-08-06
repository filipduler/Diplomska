package history

import "time"

type historyRequest struct {
	From *time.Time `json:"from"`
	To   *time.Time `json:"to"`
}

type historyType string

const (
	TimeEntry historyType = "TE"
	TimeOff   historyType = "TF"
)

type historyEntryModel struct {
	Id              int64       `json:"id"`
	Type            historyType `json:"type"`
	StartTimeUtc    time.Time   `json:"startTimeUtc"`
	EndTimeUtc      time.Time   `json:"endTimeUtc"`
	LogType         int64       `json:"logType"`
	LastUpdateOnUtc time.Time   `json:"lastUpdateOnUtc"`
}
