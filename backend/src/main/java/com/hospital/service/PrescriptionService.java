package com.hospital.service;

import com.hospital.dto.PrescriptionRequest;
import com.hospital.dto.PrescriptionResponse;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.Prescription;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.AccessDeniedException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.hospital.dto.PrescriptionItemResponse;

import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            UserRepository userRepository) {

        this.prescriptionRepository = prescriptionRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    // CREATE PRESCRIPTION
    public PrescriptionResponse createPrescription(
            PrescriptionRequest request) {

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"));

        Prescription prescription = Prescription.builder()
                .doctor(doctor)
                .patient(patient)
                .prescriptionDate(request.getPrescriptionDate())
                .notes(request.getNotes())
                .build();

        return toResponse(
                prescriptionRepository.save(prescription)
        );
    }

    // GET ALL PRESCRIPTIONS
    public List<PrescriptionResponse> getAllPrescriptions() {

        return prescriptionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET PRESCRIPTION BY ID
    public PrescriptionResponse getPrescriptionById(Long id) {

        Prescription prescription =
                prescriptionRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Prescription not found"));

        String loggedInUsername =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        User loggedInUser =
                userRepository.findByUsername(loggedInUsername)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Logged-in user not found"));

        // PATIENT → own prescription only
        if (loggedInUser.getRole() == Role.PATIENT &&
                !prescription.getPatient()
                        .getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access this prescription"
            );
        }

        return toResponse(prescription);
    }

    // GET PATIENT PRESCRIPTIONS
    public List<PrescriptionResponse> getPatientPrescriptions(
            Long patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"));

        String loggedInUsername =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        User loggedInUser =
                userRepository.findByUsername(loggedInUsername)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Logged-in user not found"));

        // PATIENT → own prescriptions only
        if (loggedInUser.getRole() == Role.PATIENT &&
                !patient.getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access these prescriptions"
            );
        }

        return prescriptionRepository
                .findByPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET DOCTOR PRESCRIPTIONS
    public List<PrescriptionResponse> getDoctorPrescriptions(
            Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"));

        String loggedInUsername =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        User loggedInUser =
                userRepository.findByUsername(loggedInUsername)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Logged-in user not found"));

        // DOCTOR → own prescriptions only
        if (loggedInUser.getRole() == Role.DOCTOR &&
                !doctor.getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access these prescriptions"
            );
        }

        return prescriptionRepository
                .findByDoctorId(doctorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ENTITY → RESPONSE
  private PrescriptionResponse toResponse(
        Prescription prescription) {

    Doctor doctor = prescription.getDoctor();
    Patient patient = prescription.getPatient();

    List<PrescriptionItemResponse> items =
            prescription.getItems()
                    .stream()
                    .map(item -> new PrescriptionItemResponse(
                            item.getId(),
                            prescription.getId(),
                            item.getMedicine().getId(),
                            item.getMedicine().getName(),
                            item.getQuantity(),
                            item.getDosage(),
                            item.getFrequency(),
                            item.getDurationDays(),
                            item.getInstructions()
                    ))
                    .toList();

    return new PrescriptionResponse(
            prescription.getId(),
            doctor.getId(),
            doctor.getFullName(),
            patient.getId(),
            patient.getFullName(),
            prescription.getPrescriptionDate(),
            prescription.getNotes(),
            items
    );

    }
}