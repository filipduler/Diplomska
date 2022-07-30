package timeoff

import "time"

type saveRequest struct {
	Id        *int64    `json:"id"`
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime"`
	Note      string    `json:"note"`
	TypeId    int64     `json:"typeId"`
}

type timeOffModel struct {
	Id           int64     `json:"id"`
	StartTimeUtc time.Time `json:"startTimeUtc"`
	EndTimeUtc   time.Time `json:"endTimeUtc"`
	Note         string    `json:"note"`
	Type         typeModel `json:"type"`
	Status       typeModel `json:"status"`
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

type historyAction int

const (
	RequestOpen historyAction = iota
	RequestClosed
	TimeChange
	TypeChange
)

type historyModel struct {
	Action       historyAction `json:"action"`
	StartTimeUtc *time.Time    `json:"startTimeUtc,omitempty"`
	EndTimeUtc   *time.Time    `json:"endTimeUtc,omitempty"`
	Type         *string       `json:"type,omitempty"`
	Status       *string       `json:"status,omitempty"`
}
