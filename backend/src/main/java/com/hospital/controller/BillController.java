package com.hospital.controller;

import com.hospital.dto.BillRequest;
import com.hospital.dto.BillResponse;
import com.hospital.service.BillService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping
    public ResponseEntity<BillResponse> createBill(
            @Valid @RequestBody BillRequest request) {

        return ResponseEntity.ok(
                billService.createBill(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<BillResponse>> getAllBills() {

        return ResponseEntity.ok(
                billService.getAllBills()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillResponse> getBillById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                billService.getBillById(id)
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<BillResponse>> getPatientBills(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                billService.getPatientBills(patientId)
        );
    }
}