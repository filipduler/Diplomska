package internal

import "time"

type ChangeRequest struct {
	From time.Time `json:"from"`
	To   time.Time `json:"to"`
}

type ChangeModel struct {
	Id              int64     `json:"id"`
	ModifierUserId  int64     `json:"modifierUserId"`
	ModifierName    string    `json:"modifierName"`
	LogType         int64     `json:"logType"`
	LastUpdateOnUtc time.Time `json:"lastUpdateOnUtc"`
}
