use std::sync::Arc;

use axum::extract::{Path, State};
use axum::Json;
use validator::{Validate, ValidationErrors};

use crate::dto::{ApiResponse, UserRequest};
use crate::error::AppError;
use crate::models::User;
use crate::AppState;

/// Mirrors `GlobalExceptionHandler.handleValidationException`: join every
/// field error into a single `"field: message, field: message"` string.
fn format_validation_errors(errors: ValidationErrors) -> String {
    errors
        .field_errors()
        .iter()
        .flat_map(|(field, errs)| {
            errs.iter().map(move |e| {
                let message = e
                    .message
                    .clone()
                    .map(|m| m.to_string())
                    .unwrap_or_else(|| e.code.to_string());
                format!("{field}: {message}")
            })
        })
        .collect::<Vec<_>>()
        .join(", ")
}

fn validate(request: &UserRequest) -> Result<(), AppError> {
    request
        .validate()
        .map_err(|e| AppError::Validation(format_validation_errors(e)))
}

/// Mirrors `UserController.getAllUsers()`.
pub async fn get_all_users(State(state): State<Arc<AppState>>) -> ApiResponse<Vec<User>> {
    ApiResponse::success(state.user_service.find_all())
}

/// Mirrors `UserController.getUserById()`.
pub async fn get_user_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<u64>,
) -> Result<ApiResponse<User>, AppError> {
    Ok(ApiResponse::success(state.user_service.find_by_id(id)?))
}

/// Mirrors `UserController.createUser()`.
pub async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(request): Json<UserRequest>,
) -> Result<ApiResponse<User>, AppError> {
    validate(&request)?;
    let user = state.user_service.create(request);
    Ok(ApiResponse::success_with_message(
        "User created successfully",
        Some(user),
    ))
}

/// Mirrors `UserController.updateUser()`.
pub async fn update_user(
    State(state): State<Arc<AppState>>,
    Path(id): Path<u64>,
    Json(request): Json<UserRequest>,
) -> Result<ApiResponse<User>, AppError> {
    validate(&request)?;
    let user = state.user_service.update(id, request)?;
    Ok(ApiResponse::success_with_message(
        "User updated successfully",
        Some(user),
    ))
}

/// Mirrors `UserController.deleteUser()`.
pub async fn delete_user(
    State(state): State<Arc<AppState>>,
    Path(id): Path<u64>,
) -> Result<ApiResponse<()>, AppError> {
    state.user_service.delete(id)?;
    Ok(ApiResponse::success_with_message(
        "User deleted successfully",
        None,
    ))
}
