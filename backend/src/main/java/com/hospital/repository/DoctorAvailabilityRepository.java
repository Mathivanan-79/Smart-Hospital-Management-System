package com.hospital.repository;

import com.hospital.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorAvailabilityRepository
        extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorId(Long doctorId);

    List<DoctorAvailability> findByDoctorIdAndDayOfWeek(
            Long doctorId,
            String dayOfWeek
    );
}