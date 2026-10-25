package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PrescriptionItemResponse {

    private Long id;

    private Long prescriptionId;

    private Long medicineId;
    private String medicineName;

    private int quantity;
    private String dosage;
    private String frequency;
    private int durationDays;
    private String instructions;
}