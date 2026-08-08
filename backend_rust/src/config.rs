use std::env;

/// Mirrors `application.yml` / `application-prod.yml` / `application.properties`.
/// All values are read from the environment so the same binary works for both
/// profiles; only the *defaults* differ from what the Java app used per-profile.
#[derive(Debug, Clone)]
pub struct AppConfig {
    pub port: u16,
    pub cors_allowed_origins: Vec<String>,
    pub cors_allowed_methods: Vec<String>,
    pub cors_allowed_headers: Vec<String>,
    pub cors_max_age: u64,
    pub jwt_secret_key: String,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let port = env::var("PORT")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(8080);

        let cors_allowed_origins = env_list(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000",
        );
        let cors_allowed_methods = env_list(
            "CORS_ALLOWED_METHODS",
            "GET,POST,PUT,DELETE,OPTIONS",
        );
        let cors_allowed_headers = env_list("CORS_ALLOWED_HEADERS", "*");
        let cors_max_age = env::var("CORS_MAX_AGE")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(3600);

        // Spring fails to start without this being resolvable; we mirror that.
        let jwt_secret_key = env::var("JWT_SECRET_KEY")
            .expect("JWT_SECRET_KEY environment variable must be set (see .env.example)");

        Self {
            port,
            cors_allowed_origins,
            cors_allowed_methods,
            cors_allowed_headers,
            cors_max_age,
            jwt_secret_key,
        }
    }
}

fn env_list(key: &str, default: &str) -> Vec<String> {
    env::var(key)
        .unwrap_or_else(|_| default.to_string())
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}
