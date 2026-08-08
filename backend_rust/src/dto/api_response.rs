use axum::http::StatusCode;
use axum::response::{IntoResponse, Json, Response};
use serde::Serialize;

/// Mirrors `com.example.fullstack.dto.ApiResponse<T>`. Jackson serializes all
/// three fields (including a null `data`) by default, so we don't skip nulls here.
#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub code: u16,
    pub message: String,
    pub data: Option<T>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            code: 200,
            message: "success".to_string(),
            data: Some(data),
        }
    }

    pub fn success_with_message(message: impl Into<String>, data: Option<T>) -> Self {
        Self {
            code: 200,
            message: message.into(),
            data,
        }
    }

    pub fn error(code: u16, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
            data: None,
        }
    }
}

impl<T: Serialize> IntoResponse for ApiResponse<T> {
    fn into_response(self) -> Response {
        // The envelope always carries its own `code`; the HTTP status for the
        // success path is always 200 (handlers return ApiResponse directly,
        // exactly like the Java controllers did).
        (StatusCode::OK, Json(self)).into_response()
    }
}
