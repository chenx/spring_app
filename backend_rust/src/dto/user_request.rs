use serde::Deserialize;
use validator::{Validate, ValidationError};

/// Mirrors `com.example.fullstack.dto.UserRequest`'s `@Valid` constraints
/// (`@NotBlank` + `@Size(2,50)` on username, `@NotBlank` + `@Email` on email).
#[derive(Debug, Deserialize, Validate)]
pub struct UserRequest {
    #[validate(custom(function = "validate_username"))]
    pub username: String,

    #[validate(custom(function = "validate_email"))]
    pub email: String,

    pub role: Option<String>,
}

fn validate_username(username: &str) -> Result<(), ValidationError> {
    if username.trim().is_empty() {
        return Err(ValidationError::new("blank").with_message("Username is required".into()));
    }
    let len = username.chars().count();
    if !(2..=50).contains(&len) {
        return Err(ValidationError::new("size")
            .with_message("Username must be between 2 and 50 characters".into()));
    }
    Ok(())
}

fn validate_email(email: &str) -> Result<(), ValidationError> {
    if email.trim().is_empty() {
        return Err(ValidationError::new("blank").with_message("Email is required".into()));
    }
    if !validator::ValidateEmail::validate_email(&email) {
        return Err(ValidationError::new("email").with_message("Email must be valid".into()));
    }
    Ok(())
}
