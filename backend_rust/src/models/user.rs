use chrono::NaiveDateTime;
use serde::Serialize;

/// Mirrors `com.example.fullstack.model.User`. `created_at` uses a naive
/// (offset-less) datetime to match Jackson's ISO-8601 rendering of Java's
/// `LocalDateTime` (no timezone component).
#[derive(Debug, Clone, Serialize)]
pub struct User {
    pub id: u64,
    pub username: String,
    pub email: String,
    pub role: String,
    pub created_at: NaiveDateTime,
}
