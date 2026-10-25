package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class PatientResponse {

    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String phone;
    private String address;
    private String emergencyContact;
}