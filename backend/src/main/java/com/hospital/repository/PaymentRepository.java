package com.hospital.repository;

import com.hospital.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Get all payments for a specific bill
    List<Payment> findByBillId(Long billId);

    // Get all payments belonging to a specific patient
    List<Payment> findByBillPatientId(Long patientId);
}