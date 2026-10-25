package com.hospital.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrescriptionItemRequest {

    @NotNull(message = "Prescription ID is required")
    private Long prescriptionId;

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    @Min(value = 1, message = "Duration must be at least 1 day")
    private int durationDays;

    private String instructions;
}