package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DoctorResponse {

    private Long id;

    private Long userId;
    private String username;
    private String email;

    private Long departmentId;
    private String departmentName;

    private String fullName;
    private String specialization;
    private String qualification;
    private int experienceYears;
    private String phone;
}