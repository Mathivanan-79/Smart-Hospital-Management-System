package com.hospital.controller;

import com.hospital.dto.CreateDoctorRequest;
import com.hospital.dto.DoctorRequest;
import com.hospital.dto.DoctorResponse;
import com.hospital.service.DoctorService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }


    // CREATE USER + DOCTOR PROFILE

    @PostMapping
    public ResponseEntity<DoctorResponse> createDoctor(
            @Valid @RequestBody CreateDoctorRequest request) {

        DoctorResponse response =
                doctorService.createDoctorWithUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // GET ALL DOCTORS

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {

        return ResponseEntity.ok(
                doctorService.getAllDoctors()
        );
    }


    // GET DOCTOR BY ID

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> getDoctorById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                doctorService.getDoctorById(id)
        );
    }


    // UPDATE DOCTOR PROFILE

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponse> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequest request) {

        return ResponseEntity.ok(
                doctorService.updateDoctor(id, request)
        );
    }


    // DELETE DOCTOR PROFILE

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(
            @PathVariable Long id) {

        doctorService.deleteDoctor(id);

        return ResponseEntity.noContent().build();
    }
}