package com.hospital.dto;

import com.hospital.entity.BillStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class BillResponse {

    private Long id;

    private Long patientId;
    private String patientName;

    private LocalDate billDate;

    private double consultationFee;
    private double medicineCharges;
    private double otherCharges;

    private double totalAmount;

    private BillStatus status;
}