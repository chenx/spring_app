use bcrypt::{hash, verify, DEFAULT_COST};

use crate::error::AppError;

/// Mirrors the single in-memory user registered in
/// `SecurityConfig.userDetailsService` (`user` / bcrypt-hashed `pAssword26`).
pub struct AuthService {
    username: String,
    password_hash: String,
}

impl AuthService {
    pub fn new() -> Self {
        Self {
            username: "user".to_string(),
            password_hash: hash("", DEFAULT_COST)
                .expect("bcrypt hashing of the seed password should never fail"),
        }
    }

    /// Returns the authenticated principal's name on success. On failure,
    /// mirrors Spring's `BadCredentialsException` -- a `RuntimeException`
    /// that `AuthController` lets propagate up to `GlobalExceptionHandler`,
    /// which maps it to a 404, not 401.
    pub fn authenticate(&self, username: &str, password: &str) -> Result<String, AppError> {
        if username == self.username && verify(password, &self.password_hash).unwrap_or(false) {
            Ok(self.username.clone())
        } else {
            Err(AppError::NotFound("Bad credentials".to_string()))
        }
    }
}
