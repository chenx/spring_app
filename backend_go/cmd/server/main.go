package main

import (
	"log"
	"net/http"

	"backend_go/internal/config"
	"backend_go/internal/router"
	"backend_go/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	userService := service.NewUserService()
	authService := service.NewAuthService()
	jwtService := service.NewJWTService(cfg.JWTSecretKey)

	mux := router.NewRouter(cfg, userService, authService, jwtService)

	addr := ":" + cfg.Port
	log.Printf("demo-fullstack-backend listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
