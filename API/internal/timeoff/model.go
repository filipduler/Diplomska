package timeoff

import "time"

type saveRequest struct {
	Id           *int64    `json:"id"`
	StartTimeUtc time.Time `json:"startTimeUtc"`
	EndTimeUtc   time.Time `json:"endTimeUtc"`
	Note         string    `json:"note"`
	TypeId       int64     `json:"typeId"`
}

type timeOffModel struct {
	Id           int64     `json:"id"`
	StartTimeUtc time.Time `json:"startTimeUtc"`
	EndTimeUtc   time.Time `json:"endTimeUtc"`
	Note         string    `json:"note"`
	Type         typeModel `json:"type"`
	Status       int64     `json:"status"`
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
