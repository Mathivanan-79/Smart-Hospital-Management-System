package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DepartmentResponse {

    private Long id;
    private String name;
    private String description;
}