package handlers

import (
	"net/http"
	"runtime"
	"time"

	"backend_go/internal/httpapi"
)

func Health(w http.ResponseWriter, r *http.Request) {
	httpapi.Success(w, map[string]any{
		"status":    "UP",
		"timestamp": time.Now().Format("2006-01-02T15:04:05.999999999") + " (From Go)",
		"service":   "demo-fullstack-backend in GO",
		"sysinfo":   "Go (" + runtime.Version() + ")",
	})
}
