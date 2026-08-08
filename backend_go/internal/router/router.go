package router

import (
	"net/http"

	"backend_go/internal/config"
	"backend_go/internal/handlers"
	"backend_go/internal/middleware"
	"backend_go/internal/service"
)

// NewRouter wires routes to match SecurityConfig.java's authorizeHttpRequests
// rules, with one deliberate deviation: /api/hello is public here so it's
// easy to hit from a plain browser tab, whereas the Java app requires a
// bearer JWT for it (it falls under anyRequest().authenticated() there).
func NewRouter(cfg *config.Config, userService *service.UserService, authService *service.AuthService, jwtService *service.JWTService) http.Handler {
	authHandler := handlers.NewAuthHandler(authService, jwtService)
	userHandler := handlers.NewUserHandler(userService)

	requireAuth := middleware.RequireAuth(jwtService)

	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/auth/login", authHandler.Login)

	mux.HandleFunc("GET /api/hello", handlers.Hello)
	mux.Handle("GET /api/health", http.HandlerFunc(handlers.Health))

	mux.Handle("GET /api/users", requireAuth(http.HandlerFunc(userHandler.GetAll)))
	mux.Handle("GET /api/users/{id}", requireAuth(http.HandlerFunc(userHandler.GetByID)))
	mux.Handle("POST /api/users", requireAuth(http.HandlerFunc(userHandler.Create)))
	mux.Handle("PUT /api/users/{id}", requireAuth(http.HandlerFunc(userHandler.Update)))
	mux.Handle("DELETE /api/users/{id}", requireAuth(http.HandlerFunc(userHandler.Delete)))

	var handler http.Handler = mux
	handler = middleware.CORS(cfg)(handler)
	handler = middleware.Recover(handler)

	return handler
}
