package api

import "errors"

var (
	ErrIncorrectPermissions = errors.New("user doesn't have permissions to entry")
	ErrEntryNotFound        = errors.New("entry not found")
)
