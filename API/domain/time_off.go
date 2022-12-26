package domain

import "time"

type TimeOffModel struct {
	BaseModel
	StartTimeUtc        time.Time `gorm:"column:StartTimeUtc"`
	EndTimeUtc          time.Time `gorm:"column:EndTimeUtc"`
	Note                string    `gorm:"column:Note"`
	TimeOffTypeId       int64     `gorm:"column:TimeOffTypeId"`
	TimeOffStatusTypeId int64     `gorm:"column:TimeOffStatusTypeId"`
	UserId              int64     `gorm:"column:UserId"`

	TimeOffType *TimeOffTypeModel `gorm:"foreignKey:TimeOffTypeId"`
}

func (TimeOffModel) TableName() string {
	return "timeoff"
}
