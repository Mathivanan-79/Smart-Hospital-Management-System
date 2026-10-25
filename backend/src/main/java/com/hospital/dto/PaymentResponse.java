package com.hospital.dto;

import com.hospital.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private Long billId;
    private Long patientId;
    private String patientName;
    private double amount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private String transactionReference;
}