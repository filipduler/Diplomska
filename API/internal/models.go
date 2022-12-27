package internal

import "time"

type ChangeRequest struct {
	From *time.Time `json:"from"`
	To   *time.Time `json:"to"`
}

type ChangeModel struct {
	Id              int64     `json:"id"`
	StartTimeUtc    time.Time `json:"startTimeUtc"`
	EndTimeUtc      time.Time `json:"endTimeUtc"`
	LogType         int64     `json:"logType"`
	LastUpdateOnUtc time.Time `json:"lastUpdateOnUtc"`
}
