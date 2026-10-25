package com.hospital.service;

import com.hospital.dto.CreateDoctorRequest;
import com.hospital.dto.DoctorRequest;
import com.hospital.dto.DoctorResponse;

import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.Role;
import com.hospital.entity.User;

import com.hospital.exception.ConflictException;
import com.hospital.exception.ResourceNotFoundException;

import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(
            DoctorRepository doctorRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder) {

        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // =====================================================
    // CREATE USER + DOCTOR PROFILE
    // =====================================================

    @Transactional
    public DoctorResponse createDoctorWithUser(
            CreateDoctorRequest request) {

        // Check duplicate username

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException(
                    "Username already exists"
            );
        }

        // Check duplicate email

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException(
                    "Email already exists"
            );
        }

        // Find department

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        // Create doctor login account

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .role(Role.DOCTOR)
                .active(true)
                .build();

        user = userRepository.save(user);

        // Create doctor profile

        Doctor doctor = Doctor.builder()
                .user(user)
                .department(department)
                .fullName(request.getFullName())
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .experienceYears(request.getExperienceYears())
                .phone(request.getPhone())
                .build();

        doctor = doctorRepository.save(doctor);

        return toResponse(doctor);
    }


    // =====================================================
    // EXISTING CREATE METHOD
    // =====================================================

    public DoctorResponse createDoctor(DoctorRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        if (user.getRole() != Role.DOCTOR) {
            throw new ConflictException(
                    "User must have DOCTOR role"
            );
        }

        if (doctorRepository.existsByUserId(user.getId())) {
            throw new ConflictException(
                    "Doctor profile already exists"
            );
        }

        Doctor doctor = Doctor.builder()
                .user(user)
                .department(department)
                .fullName(request.getFullName())
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .experienceYears(request.getExperienceYears())
                .phone(request.getPhone())
                .build();

        return toResponse(
                doctorRepository.save(doctor)
        );
    }


    // =====================================================
    // GET ALL DOCTORS
    // =====================================================

    public List<DoctorResponse> getAllDoctors() {

        return doctorRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =====================================================
    // GET DOCTOR BY ID
    // =====================================================

    public DoctorResponse getDoctorById(Long id) {

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"
                        )
                );

        return toResponse(doctor);
    }


    // =====================================================
    // UPDATE DOCTOR
    // =====================================================

    public DoctorResponse updateDoctor(
            Long id,
            DoctorRequest request) {

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"
                        )
                );

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        doctor.setDepartment(department);
        doctor.setFullName(request.getFullName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setPhone(request.getPhone());

        return toResponse(
                doctorRepository.save(doctor)
        );
    }


    // =====================================================
    // DELETE DOCTOR PROFILE
    // =====================================================

    public void deleteDoctor(Long id) {

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"
                        )
                );

        doctorRepository.delete(doctor);
    }


    // =====================================================
    // ENTITY TO RESPONSE DTO
    // =====================================================

    private DoctorResponse toResponse(Doctor doctor) {

        User user = doctor.getUser();

        return new DoctorResponse(
                doctor.getId(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                doctor.getDepartment().getId(),
                doctor.getDepartment().getName(),
                doctor.getFullName(),
                doctor.getSpecialization(),
                doctor.getQualification(),
                doctor.getExperienceYears(),
                doctor.getPhone()
        );
    }
}