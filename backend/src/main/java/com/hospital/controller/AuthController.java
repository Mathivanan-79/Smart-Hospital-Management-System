package com.hospital.controller;

import com.hospital.dto.LoginRequest;
import com.hospital.entity.User;
import com.hospital.service.AuthenticationService;
import com.hospital.security.JwtService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;

    public AuthController(
            AuthenticationService authenticationService,
            JwtService jwtService) {

        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginRequest request) {

        User user = authenticationService.authenticate(
                request.getUsername(),
                request.getPassword()
        );

        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        return ResponseEntity.ok(token);
    }

    // Get currently authenticated user's details
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity.status(401).build();
        }

        User user = authenticationService.getUserByUsername(
                authentication.getName()
        );

        Map<String, Object> response = Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "role", user.getRole().name()
        );

        return ResponseEntity.ok(response);
    }
}