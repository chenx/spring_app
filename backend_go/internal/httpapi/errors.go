package httpapi

import (
	"errors"
	"net/http"

	"backend_go/internal/model"
)

// RuntimeError mirrors any plain java.lang.RuntimeException (including
// IllegalArgumentException, which extends it). The original Spring app only
// registers a handler for RuntimeException.class, so both "not found" and
// "cannot modify default account" errors resolve to HTTP 404 there — that
// quirk is intentionally preserved here rather than "fixed".
type RuntimeError struct {
	msg string
}

func NewRuntimeError(msg string) *RuntimeError {
	return &RuntimeError{msg: msg}
}

func (e *RuntimeError) Error() string { return e.msg }

// HandleError writes the ApiResponse-shaped error body for err, replicating
// GlobalExceptionHandler's precedence: validation errors -> 400, any
// RuntimeError -> 404, everything else -> 500.
func HandleError(w http.ResponseWriter, err error) {
	var fieldErrs model.FieldErrors
	var runtimeErr *RuntimeError

	switch {
	case errors.As(err, &fieldErrs):
		ErrorResponse(w, http.StatusBadRequest, 400, fieldErrs.String())
	case errors.As(err, &runtimeErr):
		ErrorResponse(w, http.StatusNotFound, 404, runtimeErr.Error())
	default:
		ErrorResponse(w, http.StatusInternalServerError, 500, "Internal server error: "+err.Error())
	}
}
