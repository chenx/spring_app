package handlers

import (
	"encoding/json"
	"net/http"

	"backend_go/internal/httpapi"
	"backend_go/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
	jwtService  *service.JWTService
}

func NewAuthHandler(authService *service.AuthService, jwtService *service.JWTService) *AuthHandler {
	return &AuthHandler{authService: authService, jwtService: jwtService}
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Login mirrors AuthController.login. Note: AuthenticationManager.authenticate
// throws an unhandled AuthenticationException (a RuntimeException) on bad
// credentials in the Java app, which GlobalExceptionHandler's
// RuntimeException.class handler turns into a 404 rather than a 401 — that
// quirk is preserved here.
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpapi.HandleError(w, httpapi.NewRuntimeError("Malformed JSON request"))
		return
	}

	if err := h.authService.Authenticate(req.Username, req.Password); err != nil {
		httpapi.HandleError(w, httpapi.NewRuntimeError(err.Error()))
		return
	}

	token, err := h.jwtService.GenerateToken(req.Username)
	if err != nil {
		httpapi.HandleError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"token":   token,
		"message": "Login successful! Token generated.",
	})
}
