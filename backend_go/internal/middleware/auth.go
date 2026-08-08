package middleware

import (
	"context"
	"net/http"
	"strings"

	"backend_go/internal/service"
)

type contextKey string

const usernameContextKey contextKey = "username"

// RequireAuth mirrors the oauth2ResourceServer bearer-JWT check that
// SecurityConfig.java applies to any endpoint not explicitly permitAll'd.
// Its failure mode (401 with no body) matches the custom
// HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED) configured there.
func RequireAuth(jwtService *service.JWTService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			token := strings.TrimPrefix(header, "Bearer ")
			claims, err := jwtService.ParseAndVerify(token)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), usernameContextKey, claims.Subject)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UsernameFromContext(ctx context.Context) string {
	v, _ := ctx.Value(usernameContextKey).(string)
	return v
}
