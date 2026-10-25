package com.hospital.dto;

import com.hospital.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PaymentRequest {

    @NotNull(message = "Bill ID is required")
    private Long billId;

    @DecimalMin(value = "0.01", message = "Payment amount must be greater than 0")
    private double amount;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String transactionReference;
}