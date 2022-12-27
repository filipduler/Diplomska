package service

import "errors"

var (
	ErrInvalidPermission = errors.New("user doesn't have access to resource")
)
