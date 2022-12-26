package user

import "errors"

var (
	ErrImpersonationInvalidPermission = errors.New("only administrators can impersonate other users")
)
