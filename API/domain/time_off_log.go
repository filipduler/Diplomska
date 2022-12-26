package domain

import "time"

type TimeOffLogModel struct {
	LogBaseModel
	StartTimeUtc        time.Time `gorm:"column:StartTimeUtc"`
	EndTimeUtc          time.Time `gorm:"column:EndTimeUtc"`
	TimeOffTypeId       int64     `gorm:"column:TimeOffTypeId"`
	TimeOffStatusTypeId int64     `gorm:"column:TimeOffStatusTypeId"`
	TimeOffId           int64     `gorm:"column:TimeOffId"`
	UserId              int64     `gorm:"column:UserId"`
	LogTypeId           int64     `gorm:"column:LogTypeId"`

	TimeOffType *TimeOffTypeModel `gorm:"foreignKey:TimeOffTypeId"`
}

func (TimeOffLogModel) TableName() string {
	return "timeofflog"
}
