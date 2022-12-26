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
	StartTimeUtc    *time.Time    `json:"startTimeUtc,omitempty"`
	EndTimeUtc      *time.Time    `json:"endTimeUtc,omitempty"`
	Type            *string       `json:"type,omitempty"`
	Status          *int64        `json:"status,omitempty"`
}
