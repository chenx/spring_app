use chrono::Local;
use serde_json::json;

use crate::dto::ApiResponse;

/// Mirrors `HealthController.health()`.
pub async fn health() -> ApiResponse<serde_json::Value> {
    // let sysinfo = concat!("Rust (", env!("CARGO_PKG_VERSION"), ")");
    let rust_version = rustc_version_runtime::version();
    let sysinfo = format!("Rust ({})", rust_version);

    // 2. Safely formatted into a single String
    let timestamp = format!("{} (From Rust)", Local::now().naive_local());

    ApiResponse::success(json!({
        "status": "UP",
        // "timestamp": Local::now().naive_local().to_string() + " (From Rust)",
        "timestamp": timestamp,
        "service": "demo-fullstack-backend",
        "sysinfo": sysinfo,
    }))
}
