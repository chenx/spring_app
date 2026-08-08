package model

import (
	"fmt"
	"net/mail"
	"strings"
	"time"
)

type User struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
}

type UserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

// FieldErrors mirrors the "field: message" pairs produced by Jakarta Bean Validation.
type FieldErrors []string

func (f FieldErrors) String() string {
	return strings.Join(f, ", ")
}

func (r UserRequest) Validate() FieldErrors {
	var errs FieldErrors

	username := strings.TrimSpace(r.Username)
	if username == "" {
		errs = append(errs, "username: Username is required")
	} else if len(username) < 2 || len(username) > 50 {
		errs = append(errs, "username: Username must be between 2 and 50 characters")
	}

	email := strings.TrimSpace(r.Email)
	if email == "" {
		errs = append(errs, "email: Email is required")
	} else if _, err := mail.ParseAddress(email); err != nil {
		errs = append(errs, "email: Email must be valid")
	}

	return errs
}

func (f FieldErrors) Error() string {
	return fmt.Sprintf("%s", f.String())
}
