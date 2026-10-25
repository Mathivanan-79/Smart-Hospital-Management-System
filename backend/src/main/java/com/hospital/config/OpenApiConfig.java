package com.hospital.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {

        return new OpenAPI()

                // ==========================================
                // API INFORMATION
                // ==========================================
                .info(
                        new Info()
                                .title(
                                        "Smart Hospital Management System API"
                                )
                                .version("1.0")
                                .description(
                                        "REST API for Smart Hospital Management System"
                                )
                )

                // ==========================================
                // JWT SECURITY SCHEME
                // ==========================================
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        "bearerAuth",
                                        new SecurityScheme()
                                                .type(
                                                        SecurityScheme.Type.HTTP
                                                )
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                )

                // ==========================================
                // APPLY JWT SECURITY TO API OPERATIONS
                // ==========================================
                .addSecurityItem(
                        new SecurityRequirement()
                                .addList("bearerAuth")
                );
    }
}