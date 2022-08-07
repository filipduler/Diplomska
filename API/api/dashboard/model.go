package dashboard

type dashboardReponse struct {
	TodayMinutes     int64 `json:"todayMinutes"`
	WeekMinutes      int64 `json:"weekMinutes"`
	ThisMonthMinutes int64 `json:"thisMonthMinutes"`
	LastMonthMinutes int64 `json:"lastMonthMinutes"`
}
