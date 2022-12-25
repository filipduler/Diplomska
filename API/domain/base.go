package domain

import "time"

type BaseModel struct {
	Id            int64     `gorm:"primaryKey,column:Id"`
	InsertedOnUtc time.Time `gorm:"column:InsertedOnUtc"`
	UpdatedOnUtc  time.Time `gorm:"column:UpdatedOnUtc"`
}

func (model *BaseModel) OnInsert() {
	model.InsertedOnUtc = time.Now().UTC()
	model.UpdatedOnUtc = time.Now().UTC()

}

func (model *BaseModel) OnUpdate() {
	model.UpdatedOnUtc = time.Now().UTC()

}

type LogBaseModel struct {
	Id            int64     `gorm:"primaryKey,column:Id"`
	InsertedOnUtc time.Time `gorm:"column:InsertedOnUtc"`
}

func (model *LogBaseModel) OnInsert() {
	model.InsertedOnUtc = time.Now().UTC()

}
