package com.hospital.controller;

import com.hospital.dto.MedicineRequest;
import com.hospital.dto.MedicineResponse;
import com.hospital.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @PostMapping
    public ResponseEntity<MedicineResponse> createMedicine(
            @Valid @RequestBody MedicineRequest request) {

        return ResponseEntity.ok(
                medicineService.createMedicine(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<MedicineResponse>> getAllMedicines() {

        return ResponseEntity.ok(
                medicineService.getAllMedicines()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineResponse> getMedicineById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                medicineService.getMedicineById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineResponse> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request) {

        return ResponseEntity.ok(
                medicineService.updateMedicine(id, request)
        );
    }
}