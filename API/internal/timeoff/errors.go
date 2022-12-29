package timeoff

import "errors"

var (
	ErrInvalidTimeOffStatus         = errors.New("invalid time off status")
	ErrStatusAlreadyCompleted       = errors.New("time off status already completed")
	ErrStatusInvalidRequestedStatus = errors.New("users role is invalid for requested status change")
)
