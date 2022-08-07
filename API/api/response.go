package api

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
