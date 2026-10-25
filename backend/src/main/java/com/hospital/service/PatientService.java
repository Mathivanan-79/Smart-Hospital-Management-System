package com.hospital.service;

import com.hospital.dto.PatientRequest;
import com.hospital.dto.PatientResponse;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.AccessDeniedException;
import com.hospital.exception.ConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.dto.CreatePatientRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PatientService(
        PatientRepository patientRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder) {

    this.patientRepository = patientRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
}

    // =========================
    // CREATE PATIENT
    // =========================

    public PatientResponse createPatient(PatientRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        if (user.getRole() != Role.PATIENT) {
            throw new ConflictException(
                    "User must have PATIENT role");
        }

        if (patientRepository.existsByUserId(user.getId())) {
            throw new ConflictException(
                    "Patient profile already exists");
        }

        Patient patient = Patient.builder()
                .user(user)
                .fullName(request.getFullName())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .phone(request.getPhone())
                .address(request.getAddress())
                .emergencyContact(request.getEmergencyContact())
                .build();

        return toResponse(
                patientRepository.save(patient)
        );
    }

    // =========================
// CREATE USER + PATIENT
// =========================

@Transactional
public PatientResponse createPatientWithUser(
        CreatePatientRequest request) {

    // Check username
    if (userRepository.existsByUsername(request.getUsername())) {
        throw new ConflictException(
                "Username already exists"
        );
    }

    // Check email
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new ConflictException(
                "Email already exists"
        );
    }

    // Create PATIENT user
    User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            )
            .role(Role.PATIENT)
            .active(true)
            .build();

    user = userRepository.save(user);


    // Create patient profile
    Patient patient = Patient.builder()
            .user(user)
            .fullName(request.getFullName())
            .dateOfBirth(request.getDateOfBirth())
            .gender(request.getGender())
            .bloodGroup(request.getBloodGroup())
            .phone(request.getPhone())
            .address(request.getAddress())
            .emergencyContact(request.getEmergencyContact())
            .build();

    patient = patientRepository.save(patient);

    return toResponse(patient);
}

    // =========================
    // GET ALL PATIENTS
    // =========================

    public List<PatientResponse> getAllPatients() {

        return patientRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET PATIENT BY ID
    // =========================

    public PatientResponse getPatientById(Long id) {

        Patient patient = patientRepository.findById(id)
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

        // PATIENT can access only their own profile
        if (loggedInUser.getRole() == Role.PATIENT &&
                !patient.getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access this patient profile"
            );
        }

        return toResponse(patient);
    }

    // =========================
    // UPDATE PATIENT
    // =========================

    public PatientResponse updatePatient(
            Long id,
            PatientRequest request) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"));

        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(
                request.getEmergencyContact()
        );

        return toResponse(
                patientRepository.save(patient)
        );
    }

    // =========================
    // ENTITY → RESPONSE
    // =========================

    private PatientResponse toResponse(
            Patient patient) {

        User user = patient.getUser();

        return new PatientResponse(
                patient.getId(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                patient.getFullName(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getBloodGroup(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getEmergencyContact()
        );
    }
}