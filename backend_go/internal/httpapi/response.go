package httpapi

import (
	"encoding/json"
	"net/http"
)

// Response mirrors com.example.fullstack.dto.ApiResponse<T>.
type Response[T any] struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    T      `json:"data,omitempty"`
}

func Success[T any](w http.ResponseWriter, data T) {
	writeJSON(w, http.StatusOK, Response[T]{Code: 200, Message: "success", Data: data})
}

func SuccessMessage[T any](w http.ResponseWriter, message string, data T) {
	writeJSON(w, http.StatusOK, Response[T]{Code: 200, Message: message, Data: data})
}

// ErrorResponse writes an ApiResponse-shaped error body without a data field.
func ErrorResponse(w http.ResponseWriter, httpStatus, code int, message string) {
	writeJSON(w, httpStatus, Response[any]{Code: code, Message: message})
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
