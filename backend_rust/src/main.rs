mod config;
mod dto;
mod error;
mod handlers;
mod middleware;
mod models;
mod routes;
mod services;

use std::sync::Arc;

use config::AppConfig;
use services::{AuthService, JwtService, UserService};

/// Shared application state, analogous to the Spring-managed singleton
/// beans (`UserService`, `JwtService`, `SecurityConfig`'s user details
/// service) that get injected into controllers.
pub struct AppState {
    pub config: AppConfig,
    pub jwt_service: JwtService,
    pub user_service: UserService,
    pub auth_service: AuthService,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let config = AppConfig::from_env();
    let port = config.port;
    let jwt_service = JwtService::new(config.jwt_secret_key.clone());

    let state = Arc::new(AppState {
        config,
        jwt_service,
        user_service: UserService::new(),
        auth_service: AuthService::new(),
    });

    let app = routes::build_router(state);

    let listener = tokio::net::TcpListener::bind(("0.0.0.0", port))
        .await
        .expect("failed to bind TCP listener");
    tracing::info!("demo-fullstack-backend (rust) listening on port {port}");
    axum::serve(listener, app)
        .await
        .expect("server error");
}
