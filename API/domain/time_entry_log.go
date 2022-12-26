package domain

import (
	"time"
)

type TimeEntryLogModel struct {
	LogBaseModel
	StartTimeUtc time.Time `gorm:"column:StartTimeUtc"`
	EndTimeUtc   time.Time `gorm:"column:EndTimeUtc"`
	PauseSeconds int       `gorm:"column:PauseSeconds"`
	UserId       int64     `gorm:"column:UserId"`
	TimeEntryId  int64     `gorm:"column:TimeEntryId"`
	LogTypeId    int64     `gorm:"column:LogTypeId"`
}

func (TimeEntryLogModel) TableName() string {
	return "timeentrylog"
}
