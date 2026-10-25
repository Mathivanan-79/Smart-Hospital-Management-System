package com.hospital.controller;

import com.hospital.dto.PrescriptionRequest;
import com.hospital.dto.PrescriptionResponse;
import com.hospital.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(
            PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @Valid @RequestBody PrescriptionRequest request) {

        return ResponseEntity.ok(
                prescriptionService.createPrescription(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<PrescriptionResponse>> getAllPrescriptions() {

        return ResponseEntity.ok(
                prescriptionService.getAllPrescriptions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionResponse> getPrescriptionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                prescriptionService.getPrescriptionById(id)
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionResponse>> getPatientPrescriptions(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                prescriptionService.getPatientPrescriptions(patientId)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<PrescriptionResponse>> getDoctorPrescriptions(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                prescriptionService.getDoctorPrescriptions(doctorId)
        );
    }
}