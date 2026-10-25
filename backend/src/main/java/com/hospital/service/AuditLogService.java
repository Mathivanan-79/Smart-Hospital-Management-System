package com.hospital.service;

import com.hospital.dto.AuditLogRequest;
import com.hospital.dto.AuditLogResponse;
import com.hospital.entity.AuditLog;
import com.hospital.entity.User;
import com.hospital.repository.AuditLogRepository;
import com.hospital.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {

        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public AuditLogResponse createAuditLog(
            AuditLogRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(request.getAction())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(
                auditLogRepository.save(auditLog)
        );
    }

    public List<AuditLogResponse> getAllAuditLogs() {

        return auditLogRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AuditLogResponse getAuditLogById(Long id) {

        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Audit log not found"));

        return toResponse(auditLog);
    }

    public List<AuditLogResponse> getUserAuditLogs(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        return auditLogRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AuditLogResponse> getEntityAuditLogs(
            String entityType,
            Long entityId) {

        return auditLogRepository
                .findByEntityTypeAndEntityId(entityType, entityId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(AuditLog auditLog) {

        User user = auditLog.getUser();

        return new AuditLogResponse(
                auditLog.getId(),
                user.getId(),
                user.getUsername(),
                auditLog.getAction(),
                auditLog.getEntityType(),
                auditLog.getEntityId(),
                auditLog.getDescription(),
                auditLog.getCreatedAt()
        );
    }
}