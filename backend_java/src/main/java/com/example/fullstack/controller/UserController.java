package com.example.fullstack.controller;

import com.example.fullstack.dto.ApiResponse;
import com.example.fullstack.dto.UserRequest;
import com.example.fullstack.model.User;
import com.example.fullstack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<List<User>> getAllUsers() {
        return ApiResponse.success(userService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        return ApiResponse.success(userService.findById(id));
    }

    @PostMapping
    public ApiResponse<User> createUser(@Valid @RequestBody UserRequest request) {
        return ApiResponse.success("User created successfully", userService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<User> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return ApiResponse.success("User updated successfully", userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ApiResponse.success("User deleted successfully", null);
    }
}
