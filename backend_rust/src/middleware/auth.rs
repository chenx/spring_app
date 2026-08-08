use std::sync::Arc;

use axum::extract::{Request, State};
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};

use crate::services::Claims;
use crate::AppState;

/// Mirrors the two authorization tiers in `SecurityConfig`:
/// - `require_auth`: `anyRequest().authenticated()` -- any structurally valid,
///   unexpired JWT is enough (used for `/api/hello`).
/// - `require_scope_user`: `hasAuthority("SCOPE_USER")` -- additionally
///   requires the `scope` claim to equal `USER` (used for `/api/users` and
///   `/api/health`).
///
/// Both mirror `HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)`: on failure
/// they return a bare 401 with no body, not the `ApiResponse` JSON envelope
/// (that envelope is only used for errors raised *after* authentication
/// succeeds, inside handlers).
fn extract_claims(request: &Request, state: &AppState) -> Option<Claims> {
    let auth_header = request.headers().get(axum::http::header::AUTHORIZATION)?;
    let auth_header = auth_header.to_str().ok()?;
    let token = auth_header.strip_prefix("Bearer ")?;
    state.jwt_service.decode_token(token).ok()
}

pub async fn require_auth(
    State(state): State<Arc<AppState>>,
    mut request: Request,
    next: Next,
) -> Response {
    match extract_claims(&request, &state) {
        Some(claims) => {
            request.extensions_mut().insert(claims);
            next.run(request).await
        }
        None => StatusCode::UNAUTHORIZED.into_response(),
    }
}

pub async fn require_scope_user(
    State(state): State<Arc<AppState>>,
    mut request: Request,
    next: Next,
) -> Response {
    match extract_claims(&request, &state) {
        Some(claims) if claims.scope == "USER" => {
            request.extensions_mut().insert(claims);
            next.run(request).await
        }
        _ => StatusCode::UNAUTHORIZED.into_response(),
    }
}
