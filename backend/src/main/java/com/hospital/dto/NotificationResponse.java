package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private Long userId;
    private String username;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}