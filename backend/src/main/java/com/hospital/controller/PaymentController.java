package com.hospital.controller;

import com.hospital.dto.PaymentRequest;
import com.hospital.dto.PaymentResponse;
import com.hospital.service.PaymentService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // =========================
    // CREATE PAYMENT
    // =========================

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest request) {

        return ResponseEntity.ok(
                paymentService.createPayment(request)
        );
    }

    // =========================
    // GET ALL PAYMENTS
    // =========================

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }

    // =========================
    // GET PAYMENT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(id)
        );
    }

    // =========================
    // GET PAYMENTS BY BILL
    // =========================

    @GetMapping("/bill/{billId}")
    public ResponseEntity<List<PaymentResponse>> getBillPayments(
            @PathVariable Long billId) {

        return ResponseEntity.ok(
                paymentService.getBillPayments(billId)
        );
    }

    // =========================
    // GET PAYMENTS BY PATIENT
    // =========================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PaymentResponse>> getPatientPayments(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                paymentService.getPatientPayments(patientId)
        );
    }
}