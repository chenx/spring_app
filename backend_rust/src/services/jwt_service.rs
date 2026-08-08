use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

/// Mirrors the claim set built in `JwtService.generateToken` /
/// validated by `SecurityConfig.jwtDecoder`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub iss: String,
    pub iat: usize,
    pub exp: usize,
    pub scope: String,
}

/// Mirrors `com.example.fullstack.service.JwtService` plus the decoder half
/// of `SecurityConfig` (HS256, shared secret from `JWT_SECRET_KEY`, only the
/// expiry/timestamp is validated -- issuer is *not* checked, same as Java's
/// custom `DelegatingOAuth2TokenValidator` that only wires up
/// `JwtTimestampValidator`).
pub struct JwtService {
    secret: String,
}

const TOKEN_TTL_SECONDS: i64 = 3600;

impl JwtService {
    pub fn new(secret: String) -> Self {
        Self { secret }
    }

    pub fn generate_token(&self, username: &str) -> String {
        let now = chrono::Utc::now().timestamp();
        let claims = Claims {
            sub: username.to_string(),
            iss: "self".to_string(),
            iat: now as usize,
            exp: (now + TOKEN_TTL_SECONDS) as usize,
            scope: "USER".to_string(),
        };

        encode(
            &Header::default(), // HS256 is the jsonwebtoken default
            &claims,
            &EncodingKey::from_secret(self.secret.as_bytes()),
        )
        .expect("JWT encoding should never fail for well-formed claims")
    }

    pub fn decode_token(&self, token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
        // Default Validation only enforces `exp`; issuer/audience are left
        // unchecked, matching the Java decoder's timestamp-only validator.
        let validation = Validation::new(jsonwebtoken::Algorithm::HS256);
        decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.secret.as_bytes()),
            &validation,
        )
        .map(|data| data.claims)
    }
}
