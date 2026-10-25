package com.hospital.service;

import com.hospital.entity.User;
import com.hospital.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Logger log =
            LoggerFactory.getLogger(AuthenticationService.class);

    public AuthenticationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Authenticate user during login
    public User authenticate(String username, String password) {

        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            log.warn("Login failed: username not found");
            throw new RuntimeException("Invalid username or password");
        }

        log.info("Login attempt found a user. Role: {}, Active: {}",
                user.getRole(), user.isActive());

        boolean passwordMatches =
                passwordEncoder.matches(password, user.getPassword());

        log.info("Password matches stored hash: {}", passwordMatches);

        if (!passwordMatches) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException("User account is inactive");
        }

        return user;
    }

    // Retrieve user by username
    public User getUserByUsername(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }
}