package com.hospital.service;

import com.hospital.dto.PaymentRequest;
import com.hospital.dto.PaymentResponse;
import com.hospital.entity.Bill;
import com.hospital.entity.BillStatus;
import com.hospital.entity.Payment;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.AccessDeniedException;
import com.hospital.repository.BillRepository;
import com.hospital.repository.PaymentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            BillRepository billRepository,
            PatientRepository patientRepository,
            UserRepository userRepository) {

        this.paymentRepository = paymentRepository;
        this.billRepository = billRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // CREATE PAYMENT
    // =========================

    public PaymentResponse createPayment(PaymentRequest request) {

        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() ->
                        new RuntimeException("Bill not found"));

        double totalPaid = paymentRepository
                .findByBillId(bill.getId())
                .stream()
                .mapToDouble(Payment::getAmount)
                .sum();

        double remainingAmount =
                bill.getTotalAmount() - totalPaid;

        if (request.getAmount() > remainingAmount) {
            throw new RuntimeException(
                    "Payment amount exceeds remaining bill amount"
            );
        }

        Payment payment = Payment.builder()
                .bill(bill)
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate())
                .paymentMethod(request.getPaymentMethod())
                .transactionReference(request.getTransactionReference())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        double newTotalPaid =
                totalPaid + request.getAmount();

        if (newTotalPaid == bill.getTotalAmount()) {
            bill.setStatus(BillStatus.PAID);
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }

        billRepository.save(bill);

        return toResponse(savedPayment);
    }

    // =========================
    // GET ALL PAYMENTS
    // =========================

    public List<PaymentResponse> getAllPayments() {

        return paymentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET PAYMENT BY ID
    // =========================

    public PaymentResponse getPaymentById(Long id) {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        String loggedInUsername =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        User loggedInUser = userRepository
                .findByUsername(loggedInUsername)
                .orElseThrow(() ->
                        new RuntimeException("Logged-in user not found"));

        // PATIENT can access only their own payment
        if (loggedInUser.getRole() == Role.PATIENT &&
                !payment.getBill()
                        .getPatient()
                        .getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access this payment"
            );
        }

        return toResponse(payment);
    }

    // =========================
    // GET PAYMENTS BY BILL
    // =========================

    public List<PaymentResponse> getBillPayments(Long billId) {

        Bill bill = billRepository.findById(billId)
                .orElseThrow(() ->
                        new RuntimeException("Bill not found"));

        String loggedInUsername =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        User loggedInUser = userRepository
                .findByUsername(loggedInUsername)
                .orElseThrow(() ->
                        new RuntimeException("Logged-in user not found"));

        // PATIENT can access only payments
        // belonging to their own bill
        if (loggedInUser.getRole() == Role.PATIENT &&
                !bill.getPatient()
                        .getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access these payments"
            );
        }

        return paymentRepository
                .findByBillId(billId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET PAYMENTS BY PATIENT
    // =========================

    public List<PaymentResponse> getPatientPayments(Long patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        String loggedInUsername =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        User loggedInUser = userRepository
                .findByUsername(loggedInUsername)
                .orElseThrow(() ->
                        new RuntimeException("Logged-in user not found"));

        // PATIENT can access only their own payments
        if (loggedInUser.getRole() == Role.PATIENT &&
                !patient.getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access these payments"
            );
        }

        return paymentRepository
                .findByBillPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // CONVERT ENTITY → RESPONSE
    // =========================

    private PaymentResponse toResponse(Payment payment) {

        Bill bill = payment.getBill();

        return new PaymentResponse(
                payment.getId(),
                bill.getId(),
                bill.getPatient().getId(),
                bill.getPatient().getFullName(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getPaymentMethod(),
                payment.getTransactionReference()
        );
    }
}