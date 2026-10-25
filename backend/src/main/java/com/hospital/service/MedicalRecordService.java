package com.hospital.service;

import com.hospital.dto.MedicalRecordRequest;
import com.hospital.dto.MedicalRecordResponse;
import com.hospital.entity.Doctor;
import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.AccessDeniedException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public MedicalRecordService(
            MedicalRecordRepository medicalRecordRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            UserRepository userRepository) {

        this.medicalRecordRepository = medicalRecordRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // CREATE MEDICAL RECORD
    // =========================

    public MedicalRecordResponse createMedicalRecord(
            MedicalRecordRequest request) {

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"));

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .recordDate(request.getRecordDate())
                .diagnosis(request.getDiagnosis())
                .symptoms(request.getSymptoms())
                .treatment(request.getTreatment())
                .notes(request.getNotes())
                .build();

        return toResponse(
                medicalRecordRepository.save(record)
        );
    }

    // =========================
    // GET ALL MEDICAL RECORDS
    // =========================

    public List<MedicalRecordResponse> getAllMedicalRecords() {

        return medicalRecordRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET MEDICAL RECORD BY ID
    // =========================

    public MedicalRecordResponse getMedicalRecordById(Long id) {

        MedicalRecord record =
                medicalRecordRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medical record not found"));

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

        // PATIENT can access only their own medical record
        if (loggedInUser.getRole() == Role.PATIENT &&
                !record.getPatient()
                        .getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access this medical record"
            );
        }

        return toResponse(record);
    }

    // =========================
    // GET PATIENT MEDICAL RECORDS
    // =========================

    public List<MedicalRecordResponse> getPatientMedicalRecords(
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

        // PATIENT can access only their own medical records
        if (loggedInUser.getRole() == Role.PATIENT &&
                !patient.getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access these medical records"
            );
        }

        return medicalRecordRepository
                .findByPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET DOCTOR MEDICAL RECORDS
    // =========================

    public List<MedicalRecordResponse> getDoctorMedicalRecords(
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

        // DOCTOR can access only their own medical records
        if (loggedInUser.getRole() == Role.DOCTOR &&
                !doctor.getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access these medical records"
            );
        }

        return medicalRecordRepository
                .findByDoctorId(doctorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // ENTITY → RESPONSE
    // =========================

    private MedicalRecordResponse toResponse(
            MedicalRecord record) {

        Patient patient = record.getPatient();
        Doctor doctor = record.getDoctor();

        return new MedicalRecordResponse(
                record.getId(),

                patient.getId(),
                patient.getFullName(),

                doctor.getId(),
                doctor.getFullName(),

                record.getRecordDate(),
                record.getDiagnosis(),
                record.getSymptoms(),
                record.getTreatment(),
                record.getNotes()
        );
    }
}