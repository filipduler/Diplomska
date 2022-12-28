package timeoff

import "time"

type HistoryAction string

const (
	RequestOpen   HistoryAction = "RequestOpen"
	RequestClosed HistoryAction = "RequestClosed"
	TimeChange    HistoryAction = "TimeChange"
	TypeChange    HistoryAction = "TypeChange"
)

type HistoryModel struct {
	Action          HistoryAction `json:"action"`
	ModifiedByOwner bool          `json:"modifiedByOwner"`
	ModifierName    string        `json:"modifierName"`
	StartDate       *time.Time    `json:"startDate,omitempty"`
	EndDate         *time.Time    `json:"endDate,omitempty"`
	Type            *string       `json:"type,omitempty"`
	Status          *int64        `json:"status,omitempty"`
}
