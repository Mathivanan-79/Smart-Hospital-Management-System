package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MedicineResponse {

    private Long id;

    private String name;
    private String manufacturer;
    private String description;

    private double price;
    private int stockQuantity;
    private boolean active;
}