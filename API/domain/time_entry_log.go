package domain

import (
	"time"
)

type TimeEntryLogModel struct {
	LogBaseModel
	StartTimeUtc   time.Time `gorm:"column:StartTimeUtc"`
	EndTimeUtc     time.Time `gorm:"column:EndTimeUtc"`
	PauseSeconds   int       `gorm:"column:PauseSeconds"`
	ModifierUserId int64     `gorm:"column:ModifierUserId"`
	TimeEntryId    int64     `gorm:"column:TimeEntryId"`
	LogTypeId      int64     `gorm:"column:LogTypeId"`

	ModifierUser UserModel `gorm:"foreignKey:ModifierUserId"`
}

func (TimeEntryLogModel) TableName() string {
	return "timeentrylog"
}
