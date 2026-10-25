package com.hospital.service;

import com.hospital.dto.PrescriptionItemRequest;
import com.hospital.dto.PrescriptionItemResponse;
import com.hospital.entity.Medicine;
import com.hospital.entity.Prescription;
import com.hospital.entity.PrescriptionItem;
import com.hospital.repository.MedicineRepository;
import com.hospital.repository.PrescriptionItemRepository;
import com.hospital.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionItemService {

    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicineRepository medicineRepository;

    public PrescriptionItemService(
            PrescriptionItemRepository prescriptionItemRepository,
            PrescriptionRepository prescriptionRepository,
            MedicineRepository medicineRepository) {

        this.prescriptionItemRepository = prescriptionItemRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicineRepository = medicineRepository;
    }

    public PrescriptionItemResponse createPrescriptionItem(
            PrescriptionItemRequest request) {

        Prescription prescription = prescriptionRepository
                .findById(request.getPrescriptionId())
                .orElseThrow(() ->
                        new RuntimeException("Prescription not found"));

        Medicine medicine = medicineRepository
                .findById(request.getMedicineId())
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        if (medicine.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient medicine stock");
        }

        medicine.setStockQuantity(
                medicine.getStockQuantity() - request.getQuantity()
        );

        medicineRepository.save(medicine);

        PrescriptionItem item = PrescriptionItem.builder()
                .prescription(prescription)
                .medicine(medicine)
                .quantity(request.getQuantity())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .durationDays(request.getDurationDays())
                .instructions(request.getInstructions())
                .build();

        return toResponse(
                prescriptionItemRepository.save(item)
        );
    }

    public List<PrescriptionItemResponse> getItemsByPrescription(
            Long prescriptionId) {

        if (!prescriptionRepository.existsById(prescriptionId)) {
            throw new RuntimeException("Prescription not found");
        }

        return prescriptionItemRepository
                .findByPrescriptionId(prescriptionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PrescriptionItemResponse getItemById(Long id) {

        PrescriptionItem item = prescriptionItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Prescription item not found"));

        return toResponse(item);
    }

    private PrescriptionItemResponse toResponse(
            PrescriptionItem item) {

        return new PrescriptionItemResponse(
                item.getId(),
                item.getPrescription().getId(),
                item.getMedicine().getId(),
                item.getMedicine().getName(),
                item.getQuantity(),
                item.getDosage(),
                item.getFrequency(),
                item.getDurationDays(),
                item.getInstructions()
        );
    }
}