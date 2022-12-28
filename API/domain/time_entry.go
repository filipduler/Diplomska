package domain

import (
	"time"
)

type TimeEntryModel struct {
	BaseModel
	StartTimeUtc   time.Time `gorm:"column:StartTimeUtc"`
	EndTimeUtc     time.Time `gorm:"column:EndTimeUtc"`
	DailyWorkHours float64   `gorm:"column:DailyWorkHours"`
	PauseSeconds   int       `gorm:"column:PauseSeconds"`
	Note           string    `gorm:"column:Note"`
	IsDeleted      bool      `gorm:"column:IsDeleted"`
	UserId         int64     `gorm:"column:UserId"`
}

func (TimeEntryModel) TableName() string {
	return "timeentry"
}
