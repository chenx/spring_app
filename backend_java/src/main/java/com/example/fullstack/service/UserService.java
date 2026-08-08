package com.example.fullstack.service;

import com.example.fullstack.dto.UserRequest;
import com.example.fullstack.model.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class UserService {

    private final List<User> users = new CopyOnWriteArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public UserService() {
        // Initialize with sample data
        users.add(User.builder()
                .id(idGenerator.getAndIncrement())
                .username("admin")
                .email("admin@example.com")
                .role("ADMIN")
                .createdAt(LocalDateTime.now())
                .build());
        users.add(User.builder()
                .id(idGenerator.getAndIncrement())
                .username("user")
                .email("user@example.com")
                .role("USER")
                .createdAt(LocalDateTime.now())
                .build());
    }

    public List<User> findAll() {
        return users;
    }

    public User findById(Long id) {
        return users.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User create(UserRequest request) {
        User user = User.builder()
                .id(idGenerator.getAndIncrement())
                .username(request.getUsername())
                .email(request.getEmail())
                .role(request.getRole() != null ? request.getRole() : "USER")
                .createdAt(LocalDateTime.now())
                .build();
        users.add(user);
        return user;
    }

    public User update(Long id, UserRequest request) {
        if (id == 1L || id == 2L) {
            throw new IllegalArgumentException(
                "Cannot update default testing accounts"
            );
        }

        User user = findById(id);
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        return user;
    }

    public void delete(Long id) {
        if (id == 1L || id == 2L) {
            throw new IllegalArgumentException(
                "Cannot delete default testing accounts"
            );
        }

        User user = findById(id);
        users.remove(user);
    }
}
