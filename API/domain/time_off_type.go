package domain

type TimeOffTypeModel struct {
	Id   int64  `gorm:"primaryKey,column:Id"`
	Name string `gorm:"column:Name"`
}

func (TimeOffTypeModel) TableName() string {
	return "timeofftype"
}
