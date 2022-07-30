package timeoff

import "time"

type timeOffModel struct {
	Id           int64     `json:"id"`
	StartTimeUtc time.Time `json:"startTimeUtc"`
	EndTimeUtc   time.Time `json:"endTimeUtc"`
	Type         string    `json:"type"`
	Status       string    `json:"status"`
}
