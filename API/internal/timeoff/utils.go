package timeoff

import (
	"api/domain"
	"api/service/timeoff"
	"api/utils"
	"time"
)

func getTimeOffDaysBetween(from time.Time, to time.Time, userId int64) ([]int, error) {
	var days []int
	timeEntryService := timeoff.TimeOffService{}

	timeOffEntries, err := timeEntryService.GetTimeOffEntriesBetween(from, to, userId, domain.AcceptedTimeOffStatus)
	if err != nil {
		return days, err
	}

	for _, entry := range timeOffEntries {
		dayArray := utils.DaysBetweenRange(entry.StartDate, entry.EndDate)
		for _, day := range dayArray {
			weekDay := day.Weekday()
			if day.After(from) && day.Before(to) && weekDay != time.Saturday && weekDay != time.Sunday {
				days = append(days, day.Day())
			}
		}
	}

	return days, nil
}

func getTimeOffEntry(timeOffId int64, user *domain.UserModel) (*domain.TimeOffModel, error) {
	timeOffService := timeoff.TimeOffService{}

	entry, err := timeOffService.GetTimeOffEntry(timeOffId)
	if err != nil {
		return nil, err
	}

	//validate permissions
	if entry.UserId != user.EffectiveUserId() && !user.IsAdmin {
		return nil, ErrInvalidPermission
	}
	return entry, nil
}
