package com.hospital.controller;

import com.hospital.dto.PrescriptionItemRequest;
import com.hospital.dto.PrescriptionItemResponse;
import com.hospital.service.PrescriptionItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescription-items")
public class PrescriptionItemController {

    private final PrescriptionItemService prescriptionItemService;

    public PrescriptionItemController(
            PrescriptionItemService prescriptionItemService) {

        this.prescriptionItemService = prescriptionItemService;
    }

    @PostMapping
    public ResponseEntity<PrescriptionItemResponse> createPrescriptionItem(
            @Valid @RequestBody PrescriptionItemRequest request) {

        return ResponseEntity.ok(
                prescriptionItemService.createPrescriptionItem(request)
        );
    }

    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<List<PrescriptionItemResponse>>
    getItemsByPrescription(
            @PathVariable Long prescriptionId) {

        return ResponseEntity.ok(
                prescriptionItemService
                        .getItemsByPrescription(prescriptionId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionItemResponse> getItemById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                prescriptionItemService.getItemById(id)
        );
    }
}