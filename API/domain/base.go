package domain

import "time"

type BaseModel struct {
	Id            int64     `gorm:"primaryKey,column:Id"`
	InsertedOnUtc time.Time `gorm:"column:InsertedOnUtc"`
	UpdatedOnUtc  time.Time `gorm:"column:UpdatedOnUtc"`
}

func (model *BaseModel) OnInsert() {
	model.InsertedOnUtc = time.Now().UTC()
	model.UpdatedOnUtc = time.Now().UTC()

}

func (model *BaseModel) OnUpdate() {
	model.UpdatedOnUtc = time.Now().UTC()

}

type LogBaseModel struct {
	Id            int64     `gorm:"primaryKey,column:Id"`
	InsertedOnUtc time.Time `gorm:"column:InsertedOnUtc"`
}

func (model *LogBaseModel) OnInsert() {
	model.InsertedOnUtc = time.Now().UTC()

}

type LogType int64

const (
	InsertLogType LogType = 1
	UpdateLogType LogType = 2
	DeleteLogType LogType = 3
)

type TimeOffStatus int64

const (
	PendingTimeOffStatus  TimeOffStatus = 1
	AcceptedTimeOffStatus TimeOffStatus = 2
	RejectedTimeOffStatus TimeOffStatus = 3
	CanceledTimeOffStatus TimeOffStatus = 4
)

func (value TimeOffStatus) IsValid() bool {
	return value == PendingTimeOffStatus ||
		value == AcceptedTimeOffStatus ||
		value == RejectedTimeOffStatus ||
		value == CanceledTimeOffStatus
}
