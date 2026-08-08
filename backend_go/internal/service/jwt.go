package service

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

// JWTService issues and verifies minimal HS256 JWTs, mirroring the claim
// shape produced by Spring's NimbusJwtEncoder/Decoder in JwtService.java:
// issuer "self", 1-hour expiry, subject = username, "scope" claim. Only the
// expiry is validated on decode, matching the Java app's custom
// DelegatingOAuth2TokenValidator(JwtTimestampValidator only).
type JWTService struct {
	secret []byte
}

func NewJWTService(secret string) *JWTService {
	return &JWTService{secret: []byte(secret)}
}

type Claims struct {
	Issuer    string `json:"iss"`
	Subject   string `json:"sub"`
	Scope     string `json:"scope"`
	IssuedAt  int64  `json:"iat"`
	ExpiresAt int64  `json:"exp"`
}

var jwtHeader = base64URLEncode([]byte(`{"alg":"HS256","typ":"JWT"}`))

func (s *JWTService) GenerateToken(username string) (string, error) {
	now := time.Now()
	claims := Claims{
		Issuer:    "self",
		Subject:   username,
		Scope:     "USER",
		IssuedAt:  now.Unix(),
		ExpiresAt: now.Add(time.Hour).Unix(),
	}

	payload, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	signingInput := jwtHeader + "." + base64URLEncode(payload)
	signature := s.sign(signingInput)

	return signingInput + "." + signature, nil
}

func (s *JWTService) sign(signingInput string) string {
	mac := hmac.New(sha256.New, s.secret)
	mac.Write([]byte(signingInput))
	return base64URLEncode(mac.Sum(nil))
}

var (
	ErrMalformedToken   = errors.New("malformed token")
	ErrInvalidSignature = errors.New("invalid token signature")
	ErrTokenExpired     = errors.New("token has expired")
)

func (s *JWTService) ParseAndVerify(token string) (*Claims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, ErrMalformedToken
	}

	signingInput := parts[0] + "." + parts[1]
	expectedSig := s.sign(signingInput)
	if subtle.ConstantTimeCompare([]byte(expectedSig), []byte(parts[2])) != 1 {
		return nil, ErrInvalidSignature
	}

	payload, err := base64URLDecode(parts[1])
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrMalformedToken, err)
	}

	var claims Claims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrMalformedToken, err)
	}

	if time.Now().Unix() > claims.ExpiresAt {
		return nil, ErrTokenExpired
	}

	return &claims, nil
}

func base64URLEncode(b []byte) string {
	return base64.RawURLEncoding.EncodeToString(b)
}

func base64URLDecode(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}
