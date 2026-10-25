package com.hospital.service;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.AppointmentStatusRequest;
import com.hospital.entity.Appointment;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.AccessDeniedException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            UserRepository userRepository) {

        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // CREATE APPOINTMENT
    // =========================

    public AppointmentResponse createAppointment(
            AppointmentRequest request) {

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"));

        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .reason(request.getReason())
                .build();

        return toResponse(
                appointmentRepository.save(appointment)
        );
    }

    // =========================
    // GET ALL APPOINTMENTS
    // =========================

    public List<AppointmentResponse> getAllAppointments() {

        return appointmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET APPOINTMENT BY ID
    // =========================

    public AppointmentResponse getAppointmentById(Long id) {

        Appointment appointment =
                appointmentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"));

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

        // PATIENT can access only their own appointment
        if (loggedInUser.getRole() == Role.PATIENT &&
                !appointment.getPatient()
                        .getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access this appointment"
            );
        }

        return toResponse(appointment);
    }

    // =========================
    // GET DOCTOR APPOINTMENTS
    // =========================

    public List<AppointmentResponse> getDoctorAppointments(
            Long doctorId) {

        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException(
                    "Doctor not found");
        }

        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET PATIENT APPOINTMENTS
    // =========================

    public List<AppointmentResponse> getPatientAppointments(
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

        // PATIENT can access only their own appointments
        if (loggedInUser.getRole() == Role.PATIENT &&
                !patient.getUser()
                        .getId()
                        .equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access these appointments"
            );
        }

        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET APPOINTMENTS BY DATE
    // =========================

    public List<AppointmentResponse> getAppointmentsByDate(
            LocalDate date) {

        return appointmentRepository
                .findByAppointmentDate(date)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // UPDATE APPOINTMENT STATUS
    // =========================

    public AppointmentResponse updateAppointmentStatus(
            Long id,
            AppointmentStatusRequest request) {

        Appointment appointment =
                appointmentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"));

        appointment.setStatus(request.getStatus());

        return toResponse(
                appointmentRepository.save(appointment)
        );
    }

    // =========================
    // ENTITY → RESPONSE
    // =========================

    private AppointmentResponse toResponse(
            Appointment appointment) {

        Doctor doctor = appointment.getDoctor();
        Patient patient = appointment.getPatient();

        return new AppointmentResponse(
                appointment.getId(),

                doctor.getId(),
                doctor.getFullName(),

                patient.getId(),
                patient.getFullName(),

                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),

                appointment.getReason(),
                appointment.getStatus()
        );
    }
}