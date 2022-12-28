package daysoff

import (
	"api/domain"
	"api/utils"
	"time"
)

type DaysOffService struct{}

func (*DaysOffService) GetDaysOff(from time.Time, to time.Time) ([]domain.DayOffModel, error) {
	db := utils.GetConnection()

	var daysOff []domain.DayOffModel
	tx := db.
		Where("Date BETWEEN ? AND ?", from, to).
		Find(&daysOff)

	return daysOff, tx.Error
}
