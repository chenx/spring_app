use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::RwLock;

use chrono::Local;

use crate::dto::UserRequest;
use crate::error::AppError;
use crate::models::User;

/// Mirrors `com.example.fullstack.service.UserService`: an in-memory,
/// thread-safe user store (Java used `CopyOnWriteArrayList` + `AtomicLong`;
/// here `RwLock<Vec<User>>` + `AtomicU64` play the same role), seeded with
/// two accounts whose ids (1, 2) are protected from update/delete.
pub struct UserService {
    users: RwLock<Vec<User>>,
    id_generator: AtomicU64,
}

impl UserService {
    pub fn new() -> Self {
        let now = Local::now().naive_local();
        let users = vec![
            User {
                id: 1,
                username: "admin".to_string(),
                email: "admin@example.com".to_string(),
                role: "ADMIN".to_string(),
                created_at: now,
            },
            User {
                id: 2,
                username: "user".to_string(),
                email: "user@example.com".to_string(),
                role: "USER".to_string(),
                created_at: now,
            },
        ];

        Self {
            users: RwLock::new(users),
            id_generator: AtomicU64::new(3),
        }
    }

    pub fn find_all(&self) -> Vec<User> {
        self.users.read().unwrap().clone()
    }

    pub fn find_by_id(&self, id: u64) -> Result<User, AppError> {
        self.users
            .read()
            .unwrap()
            .iter()
            .find(|u| u.id == id)
            .cloned()
            .ok_or_else(|| AppError::NotFound(format!("User not found with id: {id}")))
    }

    pub fn create(&self, request: UserRequest) -> User {
        let id = self.id_generator.fetch_add(1, Ordering::SeqCst);
        let user = User {
            id,
            username: request.username,
            email: request.email,
            role: request.role.unwrap_or_else(|| "USER".to_string()),
            created_at: Local::now().naive_local(),
        };
        self.users.write().unwrap().push(user.clone());
        user
    }

    pub fn update(&self, id: u64, request: UserRequest) -> Result<User, AppError> {
        if id == 1 || id == 2 {
            return Err(AppError::NotFound(
                "Cannot update default testing accounts".to_string(),
            ));
        }

        let mut users = self.users.write().unwrap();
        let user = users
            .iter_mut()
            .find(|u| u.id == id)
            .ok_or_else(|| AppError::NotFound(format!("User not found with id: {id}")))?;

        user.username = request.username;
        user.email = request.email;
        if let Some(role) = request.role {
            user.role = role;
        }
        Ok(user.clone())
    }

    pub fn delete(&self, id: u64) -> Result<(), AppError> {
        if id == 1 || id == 2 {
            return Err(AppError::NotFound(
                "Cannot delete default testing accounts".to_string(),
            ));
        }

        let mut users = self.users.write().unwrap();
        let len_before = users.len();
        users.retain(|u| u.id != id);
        if users.len() == len_before {
            return Err(AppError::NotFound(format!("User not found with id: {id}")));
        }
        Ok(())
    }
}
