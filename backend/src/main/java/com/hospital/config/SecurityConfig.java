package com.hospital.config;

import com.hospital.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // ==========================================
                // CSRF
                // ==========================================
                .csrf(csrf -> csrf.disable())

                // ==========================================
                // CORS
                // ==========================================
                .cors(cors -> {})

                // ==========================================
                // SESSION MANAGEMENT
                // ==========================================
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // ==========================================
                // AUTHORIZATION
                // ==========================================
                .authorizeHttpRequests(auth -> auth

                        // ==========================================
                        // CORS PREFLIGHT REQUESTS
                        // ==========================================
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        // ==========================================
                        // SWAGGER / OPENAPI
                        // ==========================================
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        )
                        .permitAll()

                        // ==========================================
                        // AUTHENTICATION
                        // ==========================================

                        // Login does not require authentication
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login"
                        )
                        .permitAll()

                        // Current authenticated user's details
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/auth/me"
                        )
                        .authenticated()

                        // Other authentication endpoints
                        .requestMatchers("/api/auth/**")
                        .authenticated()

                        // ==========================================
                        // USERS - ADMIN ONLY
                        // ==========================================
                        .requestMatchers("/api/users/**")
                        .hasRole("ADMIN")

                        // ==========================================
                        // AUDIT LOGS - ADMIN ONLY
                        // ==========================================
                        .requestMatchers("/api/audit-logs/**")
                        .hasRole("ADMIN")

                        // ==========================================
                        // DEPARTMENTS
                        // ==========================================
                        .requestMatchers("/api/departments/**")
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST",
                                "PATIENT"
                        )

                        // ==========================================
                        // DOCTORS
                        // ==========================================
                        .requestMatchers("/api/doctors/**")
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST",
                                "PATIENT"
                        )

                        // ==========================================
                        // PATIENTS
                        // ==========================================

                        // Create patient
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/patients"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "RECEPTIONIST"
                        )

                        // Update patient
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/patients/*"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST"
                        )

                        // Read patients
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/patients/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST",
                                "PATIENT"
                        )

                        // ==========================================
                        // APPOINTMENTS
                        // ==========================================

                        // Update appointment status: staff only
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/appointments/*/status"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST"
                        )

                        // Doctor appointment list
                        .requestMatchers(
                                "/api/appointments/doctor/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST"
                        )

                        // Date-based appointment search
                        .requestMatchers(
                                "/api/appointments/date/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST"
                        )

                        // Patient appointment list
                        .requestMatchers(
                                "/api/appointments/patient/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST",
                                "PATIENT"
                        )

                        // Get appointment by ID
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/appointments/*"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST",
                                "PATIENT"
                        )

                        // List all appointments: staff only
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/appointments"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST"
                        )

                        // Create appointment
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/appointments"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST",
                                "PATIENT"
                        )

                        // Other appointment operations: staff only
                        .requestMatchers(
                                "/api/appointments/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST"
                        )

                        // ==========================================
                        // MEDICAL RECORDS
                        // ==========================================
                        .requestMatchers(
                                "/api/medical-records/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "PATIENT"
                        )

                        // ==========================================
                        // PRESCRIPTIONS
                        // ==========================================
                        .requestMatchers(
                                "/api/prescriptions/**",
                                "/api/prescription-items/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "PATIENT"
                        )

                        // ==========================================
                        // MEDICINES
                        // ==========================================
                        .requestMatchers(
                                "/api/medicines/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST"
                        )

                        // ==========================================
                        // DOCTOR AVAILABILITY
                        // ==========================================
                        .requestMatchers(
                                "/api/availability/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST",
                                "PATIENT"
                        )

                        // ==========================================
                        // BILLING
                        // ==========================================
                        .requestMatchers(
                                "/api/bills/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "RECEPTIONIST",
                                "DOCTOR",
                                "PATIENT"
                        )

                        // ==========================================
                        // PAYMENTS
                        // ==========================================
                        .requestMatchers(
                                "/api/payments/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "RECEPTIONIST",
                                "PATIENT"
                        )

                        // ==========================================
                        // NOTIFICATIONS
                        // ==========================================
                        .requestMatchers(
                                "/api/notifications/**"
                        )
                        .authenticated()

                        // ==========================================
                        // EVERYTHING ELSE
                        // ==========================================
                        .anyRequest()
                        .authenticated()
                )

                // ==========================================
                // JWT FILTER
                // ==========================================
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // ==========================================
    // CORS CONFIGURATION
    // ==========================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // React frontend
        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        // Allowed HTTP methods
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // Allow request headers
        configuration.setAllowedHeaders(
                List.of("*")
        );

        // Allow credentials
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}