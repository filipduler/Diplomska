package internal

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type BaseResponse[T any] struct {
	Ok      bool     `json:"ok"`
	Payload T        `json:"payload,omitempty"`
	Errors  []string `json:"errors"`
}

func NewResponse[T any](ok bool, payload T, errs ...string) BaseResponse[T] {
	errorList := errs
	if errorList == nil {
		errorList = []string{}
	}

	return BaseResponse[T]{
		Ok:      ok,
		Payload: payload,
		Errors:  errorList,
	}
}

func NewEmptyResponse(ok bool, errs ...string) BaseResponse[interface{}] {
	errorList := errs
	if errorList == nil {
		errorList = []string{}
	}

	return BaseResponse[interface{}]{
		Ok:      ok,
		Payload: nil,
		Errors:  errorList,
	}
}

func NewHTTPError(c echo.Context, err error) error {
	c.Logger().Error(err)
	return c.JSON(http.StatusOK, NewEmptyResponse(false))
}
