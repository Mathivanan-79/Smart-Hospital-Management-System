package com.hospital.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BillRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Bill date is required")
    private LocalDate billDate;

    @DecimalMin(value = "0.0", message = "Consultation fee cannot be negative")
    private double consultationFee;

    @DecimalMin(value = "0.0", message = "Medicine charges cannot be negative")
    private double medicineCharges;

    @DecimalMin(value = "0.0", message = "Other charges cannot be negative")
    private double otherCharges;
}