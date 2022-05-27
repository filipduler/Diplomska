package db

import "time"

type BaseModel struct {
	Id            int64     `db:"Id"`
	InsertedOnUtc time.Time `db:"InsertedOnUtc"`
	UpdatedOnUtc  time.Time `db:"UpdatedOnUtc"`
}

func (b *BaseModel) BeforeInsert() {
	now := time.Now()
	b.InsertedOnUtc = now
	b.UpdatedOnUtc = now
}

func (b *BaseModel) BeforeUpdate() {
	b.UpdatedOnUtc = time.Now()
}
