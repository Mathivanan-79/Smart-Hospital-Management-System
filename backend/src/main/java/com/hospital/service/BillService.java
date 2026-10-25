package com.hospital.service;

import com.hospital.dto.BillRequest;
import com.hospital.dto.BillResponse;
import com.hospital.entity.Bill;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.AccessDeniedException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.BillRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public BillService(
            BillRepository billRepository,
            PatientRepository patientRepository,
            UserRepository userRepository) {

        this.billRepository = billRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    // CREATE BILL
    @Transactional
    public BillResponse createBill(BillRequest request) {

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found"));

        double totalAmount =
                request.getConsultationFee()
                + request.getMedicineCharges()
                + request.getOtherCharges();

        Bill bill = Bill.builder()
                .patient(patient)
                .billDate(request.getBillDate())
                .consultationFee(request.getConsultationFee())
                .medicineCharges(request.getMedicineCharges())
                .otherCharges(request.getOtherCharges())
                .totalAmount(totalAmount)
                .build();

        return toResponse(billRepository.save(bill));
    }

    // GET ALL BILLS
    public List<BillResponse> getAllBills() {

        User loggedInUser = getLoggedInUser();

        if (loggedInUser.getRole() == Role.PATIENT) {
            throw new AccessDeniedException(
                    "Patients cannot access the hospital-wide bill list");
        }

        return billRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET BILL BY ID
    public BillResponse getBillById(Long id) {

        Bill bill = billRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Bill not found"));

        validatePatientAccess(bill.getPatient());

        return toResponse(bill);
    }

    // GET BILLS BY PATIENT
    public List<BillResponse> getPatientBills(Long patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found"));

        validatePatientAccess(patient);

        return billRepository.findByPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // VALIDATE PATIENT OWNERSHIP
    private void validatePatientAccess(Patient patient) {

        User loggedInUser = getLoggedInUser();

        if (loggedInUser.getRole() == Role.PATIENT
                && !patient.getUser().getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access these bills");
        }
    }

    // GET LOGGED-IN USER
    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {

            throw new AccessDeniedException("Authentication is required");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Logged-in user not found"));
    }

    // ENTITY TO RESPONSE DTO
    private BillResponse toResponse(Bill bill) {

        Patient patient = bill.getPatient();

        return new BillResponse(
                bill.getId(),
                patient.getId(),
                patient.getFullName(),
                bill.getBillDate(),
                bill.getConsultationFee(),
                bill.getMedicineCharges(),
                bill.getOtherCharges(),
                bill.getTotalAmount(),
                bill.getStatus()
        );
    }
}