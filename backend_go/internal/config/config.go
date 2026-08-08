package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config holds runtime settings, sourced from environment variables the same
// way the Java app's application.yml / application-prod.yml values are
// ultimately resolved (server.port, cors.*, jwt.secret-key).
type Config struct {
	Port string

	CORSAllowedOrigins []string
	CORSAllowedMethods []string
	CORSAllowedHeaders []string
	CORSMaxAge         int64

	JWTSecretKey string
}

func Load() (*Config, error) {
	secret := os.Getenv("JWT_SECRET_KEY")
	if secret == "" {
		return nil, fmt.Errorf("JWT_SECRET_KEY environment variable must be set")
	}

	cfg := &Config{
		Port:               getEnv("PORT", "8080"),
		CORSAllowedOrigins: splitCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")),
		CORSAllowedMethods: splitCSV(getEnv("CORS_ALLOWED_METHODS", "GET,POST,PUT,DELETE,OPTIONS")),
		CORSAllowedHeaders: splitCSV(getEnv("CORS_ALLOWED_HEADERS", "*")),
		JWTSecretKey:       secret,
	}

	maxAge, err := strconv.ParseInt(getEnv("CORS_MAX_AGE", "3600"), 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid CORS_MAX_AGE: %w", err)
	}
	cfg.CORSMaxAge = maxAge

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
