package com.hospital.dto;

import com.hospital.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class AppointmentResponse {

    private Long id;

    private Long doctorId;
    private String doctorName;

    private Long patientId;
    private String patientName;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;

    private String reason;
    private AppointmentStatus status;
}