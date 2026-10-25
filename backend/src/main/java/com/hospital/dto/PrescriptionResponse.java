package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class PrescriptionResponse {

    private Long id;

    private Long doctorId;
    private String doctorName;

    private Long patientId;
    private String patientName;

    private LocalDate prescriptionDate;
    private String notes;

    private List<PrescriptionItemResponse> items;
}