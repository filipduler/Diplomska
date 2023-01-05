package timeentry

import "time"

type HistoryAction string

const (
	EntryCreated HistoryAction = "EntryCreated"
	EntryDeleted HistoryAction = "EntryDeleted"
	TimeChange   HistoryAction = "TimeChange"
	PauseChange  HistoryAction = "PauseChange"
)

type HistoryModel struct {
	Action         HistoryAction `json:"action"`
	ModifierUserId int64         `json:"modifierUserId"`
	ModifierName   string        `json:"modifierName"`
	StartTimeUtc   *time.Time    `json:"startTimeUtc,omitempty"`
	EndTimeUtc     *time.Time    `json:"endTimeUtc,omitempty"`
	PauseSeconds   *int          `json:"pauseSeconds,omitempty"`
	InsertedOnUtc  time.Time     `json:"insertedOnUtc"`
}
