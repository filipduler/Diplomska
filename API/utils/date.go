package utils

import (
	"math"
	"time"
)

func DayStart(date time.Time) time.Time {
	res := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	return res
}

func DayEnd(date time.Time) time.Time {
	res := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	res = res.AddDate(0, 0, 1)
	res = res.Add(-time.Nanosecond)
	return res
}

func WeekStart(date time.Time) time.Time {
	res := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	res = res.AddDate(0, 0, -int(res.Weekday()))
	return res
}

func WeekEnd(date time.Time) time.Time {
	res := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	res = res.AddDate(0, 0, 7)
	res = WeekStart(res)
	res = res.Add(-time.Nanosecond)
	return res
}

func BeginningOfMonth(date time.Time) time.Time {
	y, m, _ := date.Date()
	return time.Date(y, m, 1, 0, 0, 0, 0, date.Location())
}

func EndOfMonth(date time.Time) time.Time {
	return BeginningOfMonth(date).AddDate(0, 1, 0).Add(-time.Nanosecond)
}

func DateEqual(date1, date2 time.Time) bool {
	y1, m1, d1 := date1.Date()
	y2, m2, d2 := date2.Date()
	return y1 == y2 && m1 == m2 && d1 == d2
}

func DaysBetweenRange(from time.Time, to time.Time) []time.Time {
	var dayArr []time.Time
	diff := from.Sub(to)
	days := int(math.Abs(diff.Hours() / 24))

	for i := 0; i <= days; i++ {
		day := from.Add(time.Hour * 24 * time.Duration(i))
		dayArr = append(dayArr, day)
	}

	return dayArr
}

func FormatHistoryDate(time time.Time) string {
	return time.Format("02, Jan 2006, 15:04")
}
