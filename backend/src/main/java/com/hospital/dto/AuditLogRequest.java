package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuditLogRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Action is required")
    private String action;

    @NotBlank(message = "Entity type is required")
    private String entityType;

    private Long entityId;

    private String description;
}