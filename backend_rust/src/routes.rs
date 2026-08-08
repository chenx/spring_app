use std::sync::Arc;
use std::time::Duration;

use axum::http::{HeaderName, HeaderValue, Method};
use axum::middleware;
use axum::routing::{get, post};
use axum::Router;
use tower_http::cors::{AllowHeaders, AllowOrigin, CorsLayer};

use crate::handlers;
use crate::middleware::{require_auth, require_scope_user};
use crate::AppState;

/// Mirrors the route table + authorization rules assembled in
/// `SecurityConfig.securityFilterChain`.
pub fn build_router(state: Arc<AppState>) -> Router {
    // `/api/auth/login`: public.
    let public_routes = Router::new().route("/api/auth/login", post(handlers::login));

    // `/api/health`: public.
    let health_routes = Router::new().route("/api/health", get(handlers::health));

    // `/api/hello`: `anyRequest().authenticated()` -- any valid JWT.
    let hello_routes = Router::new()
        .route("/api/hello", get(handlers::hello))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            require_auth,
        ));

    // `/api/health` and `/api/users*`: `hasAuthority("SCOPE_USER")`.
    let scoped_routes = Router::new()
        // .route("/api/health", get(handlers::health))
        .route(
            "/api/users",
            get(handlers::get_all_users).post(handlers::create_user),
        )
        .route(
            "/api/users/:id",
            get(handlers::get_user_by_id)
                .put(handlers::update_user)
                .delete(handlers::delete_user),
        )
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            require_scope_user,
        ));

    Router::new()
        .merge(public_routes)
        .merge(health_routes)
        .merge(hello_routes)
        .merge(scoped_routes)
        .with_state(state.clone())
        // Outermost layer: preflight `OPTIONS` requests never reach the auth
        // middleware above, matching `.requestMatchers(OPTIONS, "/**").permitAll()`.
        .layer(build_cors_layer(&state))
}

fn build_cors_layer(state: &AppState) -> CorsLayer {
    let origins: Vec<HeaderValue> = state
        .config
        .cors_allowed_origins
        .iter()
        .filter_map(|o| HeaderValue::from_str(o).ok())
        .collect();

    let methods: Vec<Method> = state
        .config
        .cors_allowed_methods
        .iter()
        .filter_map(|m| m.parse().ok())
        .collect();

    let allow_headers = if state.config.cors_allowed_headers.iter().any(|h| h == "*") {
        // Wildcard + credentials is invalid per the Fetch spec (and rejected
        // by browsers), so mirror the requested headers back instead --
        // functionally equivalent to Spring's permissive "*" + credentials
        // config, without violating the spec.
        AllowHeaders::mirror_request()
    } else {
        let headers: Vec<HeaderName> = state
            .config
            .cors_allowed_headers
            .iter()
            .filter_map(|h| h.parse().ok())
            .collect();
        AllowHeaders::list(headers)
    };

    CorsLayer::new()
        .allow_origin(AllowOrigin::list(origins))
        .allow_methods(methods)
        .allow_headers(allow_headers)
        .allow_credentials(true)
        .max_age(Duration::from_secs(state.config.cors_max_age))
}
