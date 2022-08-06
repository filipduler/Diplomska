package db

import "time"

type BaseModel struct {
	Id            int64     `db:"Id"`
	InsertedOnUtc time.Time `db:"InsertedOnUtc"`
	UpdatedOnUtc  time.Time `db:"UpdatedOnUtc"`
}

func (b *BaseModel) BeforeInsert() {
	now := time.Now().UTC()
	b.InsertedOnUtc = now
	b.UpdatedOnUtc = now
}

func (b *BaseModel) BeforeUpdate() {
	b.UpdatedOnUtc = time.Now().UTC()
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
