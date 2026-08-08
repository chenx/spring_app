package com.example.fullstack.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.fullstack.service.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService; 
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest) {
        // Authenticate the user programmatically
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), 
                loginRequest.getPassword()
            )
        );

        // 1. Generate your JWT token here (Example placeholder string)
        // String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiZXhwIjoyNTg3MDkyMDAwfQ..."; 
        // Generate the token payload string using our utility class
        String token = jwtService.generateToken(authentication);

        // 2. Return the token inside a JSON object
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message","Login successful! Token generated.");
        return ResponseEntity.ok(response);

        // In a real app, generate and return a JWT here
        // return ResponseEntity.ok("Login successful! Token generated.");
    }
}

// Simple DTO for capturing the incoming JSON request body
class LoginRequest {
    private String username;
    private String password;
    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
