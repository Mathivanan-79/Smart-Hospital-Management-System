package com.hospital.controller;

import com.hospital.dto.DoctorAvailabilityRequest;
import com.hospital.dto.DoctorAvailabilityResponse;
import com.hospital.service.DoctorAvailabilityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availability")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    public DoctorAvailabilityController(
            DoctorAvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @PostMapping
    public ResponseEntity<DoctorAvailabilityResponse> createAvailability(
            @Valid @RequestBody DoctorAvailabilityRequest request) {

        return ResponseEntity.ok(
                availabilityService.createAvailability(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<DoctorAvailabilityResponse>> getAllAvailability() {

        return ResponseEntity.ok(
                availabilityService.getAllAvailability()
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorAvailabilityResponse>> getDoctorAvailability(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                availabilityService.getDoctorAvailability(doctorId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorAvailabilityResponse> getAvailabilityById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                availabilityService.getAvailabilityById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorAvailabilityResponse> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody DoctorAvailabilityRequest request) {

        return ResponseEntity.ok(
                availabilityService.updateAvailability(id, request)
        );
    }
}