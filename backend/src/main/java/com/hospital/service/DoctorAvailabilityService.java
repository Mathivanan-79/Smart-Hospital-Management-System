package com.hospital.service;

import com.hospital.dto.DoctorAvailabilityRequest;
import com.hospital.dto.DoctorAvailabilityResponse;
import com.hospital.entity.Doctor;
import com.hospital.entity.DoctorAvailability;
import com.hospital.repository.DoctorAvailabilityRepository;
import com.hospital.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailabilityService(
            DoctorAvailabilityRepository availabilityRepository,
            DoctorRepository doctorRepository) {

        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
    }

    public DoctorAvailabilityResponse createAvailability(
            DoctorAvailabilityRequest request) {

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException(
                    "End time must be after start time");
        }

        DoctorAvailability availability =
                DoctorAvailability.builder()
                        .doctor(doctor)
                        .dayOfWeek(request.getDayOfWeek())
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .available(request.isAvailable())
                        .build();

        return toResponse(
                availabilityRepository.save(availability)
        );
    }

    public List<DoctorAvailabilityResponse> getAllAvailability() {

        return availabilityRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<DoctorAvailabilityResponse> getDoctorAvailability(
            Long doctorId) {

        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Doctor not found");
        }

        return availabilityRepository
                .findByDoctorId(doctorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DoctorAvailabilityResponse getAvailabilityById(Long id) {

        DoctorAvailability availability =
                availabilityRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Availability not found"));

        return toResponse(availability);
    }

    public DoctorAvailabilityResponse updateAvailability(
            Long id,
            DoctorAvailabilityRequest request) {

        DoctorAvailability availability =
                availabilityRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Availability not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException(
                    "End time must be after start time");
        }

        availability.setDoctor(doctor);
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setAvailable(request.isAvailable());

        return toResponse(
                availabilityRepository.save(availability)
        );
    }

    private DoctorAvailabilityResponse toResponse(
            DoctorAvailability availability) {

        Doctor doctor = availability.getDoctor();

        return new DoctorAvailabilityResponse(
                availability.getId(),
                doctor.getId(),
                doctor.getFullName(),
                availability.getDayOfWeek(),
                availability.getStartTime(),
                availability.getEndTime(),
                availability.isAvailable()
        );
    }
}