use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;

use crate::dto::ApiResponse;

/// Mirrors `GlobalExceptionHandler`. In the Java app, every "regular" runtime
/// failure — not-found, bad login credentials, and edits to the protected
/// seed accounts — is implemented as some `RuntimeException` subtype, and
/// only `MethodArgumentNotValidException` and the catch-all `Exception` get
/// more specific handlers. That means all of those cases return **404**, not
/// 401/400/409. We deliberately preserve that quirk instead of "fixing" it,
/// so this backend's API responses match the Java one byte-for-byte.
#[derive(Debug)]
pub enum AppError {
    /// Any `RuntimeException` in the Java app (not-found, bad login,
    /// protected-account edit) -> 404.
    NotFound(String),
    /// `MethodArgumentNotValidException` -> 400.
    Validation(String),
    /// Anything else -> 500.
    #[allow(dead_code)]
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, 404, msg),
            AppError::Validation(msg) => (StatusCode::BAD_REQUEST, 400, msg),
            AppError::Internal(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                500,
                format!("Internal server error: {msg}"),
            ),
        };
        (status, Json(ApiResponse::<()>::error(code, message))).into_response()
    }
}
