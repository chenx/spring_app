package middleware

import (
	"net/http"
	"strconv"
	"strings"

	"backend_go/internal/config"
)

// CORS mirrors SecurityConfig.java's corsConfigurationSource bean: origins,
// methods and headers driven by config, credentials always allowed.
func CORS(cfg *config.Config) func(http.Handler) http.Handler {
	origins := make(map[string]bool, len(cfg.CORSAllowedOrigins))
	for _, o := range cfg.CORSAllowedOrigins {
		origins[o] = true
	}
	allowedMethods := strings.Join(cfg.CORSAllowedMethods, ",")
	allowedHeaders := strings.Join(cfg.CORSAllowedHeaders, ",")
	maxAge := strconv.FormatInt(cfg.CORSMaxAge, 10)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin != "" && origins[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Vary", "Origin")
			}

			if r.Method == http.MethodOptions {
				w.Header().Set("Access-Control-Allow-Methods", allowedMethods)
				w.Header().Set("Access-Control-Allow-Headers", allowedHeaders)
				w.Header().Set("Access-Control-Max-Age", maxAge)
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
