package domain

import "time"

type DayOffModel struct {
	Id   int64     `gorm:"primaryKey,column:Id"`
	Date time.Time `gorm:"column:Date"`
}

func (DayOffModel) TableName() string {
	return "dayoff"
}
