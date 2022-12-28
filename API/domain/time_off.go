package domain

import "time"

type TimeOffModel struct {
	BaseModel
	StartDate           time.Time `gorm:"column:StartDate"`
	EndDate             time.Time `gorm:"column:EndDate"`
	Note                string    `gorm:"column:Note"`
	TimeOffTypeId       int64     `gorm:"column:TimeOffTypeId"`
	TimeOffStatusTypeId int64     `gorm:"column:TimeOffStatusTypeId"`
	UserId              int64     `gorm:"column:UserId"`

	TimeOffType *TimeOffTypeModel `gorm:"foreignKey:TimeOffTypeId"`
}

func (TimeOffModel) TableName() string {
	return "timeoff"
}
