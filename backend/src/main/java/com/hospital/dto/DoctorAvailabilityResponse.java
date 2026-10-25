package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class DoctorAvailabilityResponse {

    private Long id;

    private Long doctorId;
    private String doctorName;

    private String dayOfWeek;

    private LocalTime startTime;
    private LocalTime endTime;

    private boolean available;
}