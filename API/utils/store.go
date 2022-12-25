package utils

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var (
	db *gorm.DB
)

func init() {
	conn := GetConfig().ConnectionString

	gormDb, err := gorm.Open(mysql.Open(conn), &gorm.Config{})

	if err != nil {
		log.Fatalln(err)
	}

	db = gormDb
}

func GetConnection() *gorm.DB {
	return db
}
