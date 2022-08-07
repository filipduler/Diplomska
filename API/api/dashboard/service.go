package dashboard

import (
	"api/db"
	"api/utils"
	"time"

	"github.com/samber/lo"
)

func getDashboard(user *db.UserModel) (*dashboardReponse, error) {
	dbStore := db.New()
	response := dashboardReponse{}

	now := time.Now().UTC()
	monthStart := time.Date(now.Year(), now.Month(), 0, 0, 0, 0, 0, time.UTC)

	prevMonth := monthStart.AddDate(0, -1, 0)

	entries, err := dbStore.TimeEntry.GetValidFrom(user.Id, prevMonth)
	if err != nil {
		return nil, err
	}

	//last month
	response.LastMonthMinutes = getTimeEntrySum(entries, prevMonth, utils.EndOfMonth(prevMonth))

	//this month
	response.ThisMonthMinutes = getTimeEntrySum(entries, monthStart, utils.EndOfMonth(monthStart))

	//this week
	weekStart := utils.WeekStart(now)
	weekEnd := utils.WeekEnd(now)
	response.WeekMinutes = getTimeEntrySum(entries, weekStart, weekEnd)

	//this day
	dayStart := utils.DayStart(now)
	dayEnd := utils.DayEnd(now)
	response.TodayMinutes = getTimeEntrySum(entries, dayStart, dayEnd)

	return &response, nil
}

func getTimeEntrySum(entries []db.TimeEntryModel, from time.Time, to time.Time) int64 {
	filteredEntries := lo.Filter(entries, func(entry db.TimeEntryModel, _ int) bool {
		return entry.StartTimeUtc.After(from) && entry.StartTimeUtc.Before(to)
	})

	return lo.SumBy(filteredEntries, func(entry db.TimeEntryModel) int64 {
		return int64(entry.EndTimeUtc.Sub(entry.StartTimeUtc).Minutes())
	})
}
