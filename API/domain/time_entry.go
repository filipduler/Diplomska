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

func (m *TimeEntryModel) EffectiveSeconds() time.Duration {
	return m.EndTimeUtc.Sub(m.StartTimeUtc) - time.Duration(float64(m.PauseSeconds)*float64(time.Second))
}

func (TimeEntryModel) TableName() string {
	return "timeentry"
}
