package middleware

import (
	"fmt"
	"net/http"

	"backend_go/internal/httpapi"
)

// Recover mirrors GlobalExceptionHandler's catch-all Exception.class handler,
// turning a panic into a 500 ApiResponse instead of crashing the server.
func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				httpapi.HandleError(w, fmt.Errorf("%v", rec))
			}
		}()
		next.ServeHTTP(w, r)
	})
}
