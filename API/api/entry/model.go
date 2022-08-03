package entry

import "time"

type saveEntryRequest struct {
	Id        *int64    `json:"id"`
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime"`
	Note      string    `json:"note"`
}

type entriesResponse struct {
	Year    int          `json:"year"`
	Month   int          `json:"month"`
	Entries []entryModel `json:"entries"`
}

type entryModel struct {
	Id              int64     `json:"id"`
	StartTimeUtc    time.Time `json:"startTimeUtc"`
	EndTimeUtc      time.Time `json:"endTimeUtc"`
	TimeDiffSeconds int       `json:"timeDiffSeconds"`
	Note            string    `json:"note"`
	Day             int       `json:"day"`
}

type timerModel struct {
	Id           int64     `json:"id"`
	StartTimeUtc time.Time `json:"startTimeUtc"`
}

type historyAction string

const (
	EntryCreated historyAction = "EntryCreated"
	EntryDeleted historyAction = "EntryDeleted"
	TimeChange   historyAction = "TimeChange"
)

type historyModel struct {
	Action          historyAction `json:"action"`
	ModifiedByOwner bool          `json:"modifiedByOwner"`
	ModifierName    string        `json:"modifierName"`
	StartTimeUtc    *time.Time    `json:"startTimeUtc,omitempty"`
	EndTimeUtc      *time.Time    `json:"endTimeUtc,omitempty"`
}
