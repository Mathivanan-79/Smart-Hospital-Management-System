package com.hospital.controller;

import com.hospital.dto.AuditLogRequest;
import com.hospital.dto.AuditLogResponse;
import com.hospital.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @PostMapping
    public ResponseEntity<AuditLogResponse> createAuditLog(
            @Valid @RequestBody AuditLogRequest request) {

        return ResponseEntity.ok(
                auditLogService.createAuditLog(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAllAuditLogs() {

        return ResponseEntity.ok(
                auditLogService.getAllAuditLogs()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponse> getAuditLogById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                auditLogService.getAuditLogById(id)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogResponse>> getUserAuditLogs(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                auditLogService.getUserAuditLogs(userId)
        );
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLogResponse>> getEntityAuditLogs(
            @PathVariable String entityType,
            @PathVariable Long entityId) {

        return ResponseEntity.ok(
                auditLogService.getEntityAuditLogs(
                        entityType,
                        entityId
                )
        );
    }
}