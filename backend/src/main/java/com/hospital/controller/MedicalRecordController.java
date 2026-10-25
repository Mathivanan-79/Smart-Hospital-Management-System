package com.hospital.controller;

import com.hospital.dto.MedicalRecordRequest;
import com.hospital.dto.MedicalRecordResponse;
import com.hospital.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(
            MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    public ResponseEntity<MedicalRecordResponse> createMedicalRecord(
            @Valid @RequestBody MedicalRecordRequest request) {

        return ResponseEntity.ok(
                medicalRecordService.createMedicalRecord(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecordResponse>> getAllMedicalRecords() {

        return ResponseEntity.ok(
                medicalRecordService.getAllMedicalRecords()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecordResponse> getMedicalRecordById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                medicalRecordService.getMedicalRecordById(id)
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientMedicalRecords(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                medicalRecordService.getPatientMedicalRecords(patientId)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<MedicalRecordResponse>> getDoctorMedicalRecords(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                medicalRecordService.getDoctorMedicalRecords(doctorId)
        );
    }
}