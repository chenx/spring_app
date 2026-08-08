package service

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

// AuthService mirrors the single in-memory user that SecurityConfig.java
// registers via InMemoryUserDetailsManager.
type AuthService struct {
	username     string
	passwordHash []byte
}

func NewAuthService() *AuthService {
	hash, err := bcrypt.GenerateFromPassword([]byte(""), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	return &AuthService{username: "user", passwordHash: hash}
}

var ErrBadCredentials = errors.New("Bad credentials")

func (s *AuthService) Authenticate(username, password string) error {
	if username != s.username {
		return ErrBadCredentials
	}
	if err := bcrypt.CompareHashAndPassword(s.passwordHash, []byte(password)); err != nil {
		return ErrBadCredentials
	}
	return nil
}
