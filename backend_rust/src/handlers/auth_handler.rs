use std::sync::Arc;

use axum::extract::State;
use axum::response::Json;
use serde::Deserialize;
use serde_json::{json, Value};

use crate::error::AppError;
use crate::AppState;

/// Mirrors the package-private `LoginRequest` DTO in `AuthController.java`.
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

/// Mirrors `AuthController.login()`. Note the success body is a bare
/// `{token, message}` map, *not* the `ApiResponse` envelope -- that's what
/// the Java controller actually returns (`ResponseEntity<Map<String,
/// String>>`), so we match it exactly rather than "fixing" the
/// inconsistency.
pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<Value>, AppError> {
    let username = state
        .auth_service
        .authenticate(&payload.username, &payload.password)?;
    let token = state.jwt_service.generate_token(&username);

    Ok(Json(json!({
        "token": token,
        "message": "Login successful! Token generated.",
    })))
}
