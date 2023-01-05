package domain

import "time"

type TimeOffLogModel struct {
	LogBaseModel
	StartDate           time.Time `gorm:"column:StartDate"`
	EndDate             time.Time `gorm:"column:EndDate"`
	TimeOffTypeId       int64     `gorm:"column:TimeOffTypeId"`
	TimeOffStatusTypeId int64     `gorm:"column:TimeOffStatusTypeId"`
	TimeOffId           int64     `gorm:"column:TimeOffId"`
	ModifierUserId      int64     `gorm:"column:ModifierUserId"`
	LogTypeId           int64     `gorm:"column:LogTypeId"`

	ModifierUser UserModel        `gorm:"foreignKey:ModifierUserId"`
	TimeOffType  TimeOffTypeModel `gorm:"foreignKey:TimeOffTypeId"`
}

func (TimeOffLogModel) TableName() string {
	return "timeofflog"
}
