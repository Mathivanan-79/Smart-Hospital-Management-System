package com.hospital.controller;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.hospital.dto.AppointmentStatusRequest;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(
            AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentRequest request) {

        return ResponseEntity.ok(
                appointmentService.createAppointment(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {

        return ResponseEntity.ok(
                appointmentService.getAllAppointments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentById(id)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                appointmentService.getDoctorAppointments(doctorId)
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                appointmentService.getPatientAppointments(patientId)
        );
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDate(
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentsByDate(date)
        );
    }
    @PutMapping("/{id}/status")
public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
        @PathVariable Long id,
        @Valid @RequestBody AppointmentStatusRequest request) {

    return ResponseEntity.ok(
            appointmentService.updateAppointmentStatus(id, request)
    );
}
}