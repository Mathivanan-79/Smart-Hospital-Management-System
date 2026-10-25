package com.hospital.controller;

import com.hospital.dto.CreatePatientRequest;
import com.hospital.dto.PatientRequest;
import com.hospital.dto.PatientResponse;
import com.hospital.service.PatientService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }


    // =========================
    // CREATE PATIENT + USER
    // =========================

    @PostMapping
    public ResponseEntity<PatientResponse> createPatient(
            @Valid @RequestBody CreatePatientRequest request) {

        return ResponseEntity.ok(
                patientService.createPatientWithUser(request)
        );
    }


    // =========================
    // GET ALL PATIENTS
    // =========================

    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients() {

        return ResponseEntity.ok(
                patientService.getAllPatients()
        );
    }


    // =========================
    // GET PATIENT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getPatientById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                patientService.getPatientById(id)
        );
    }


    // =========================
    // UPDATE PATIENT
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest request) {

        return ResponseEntity.ok(
                patientService.updatePatient(id, request)
        );
    }
}