package com.hospital.service;

import com.hospital.dto.MedicineRequest;
import com.hospital.dto.MedicineResponse;
import com.hospital.entity.Medicine;
import com.hospital.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    public MedicineResponse createMedicine(MedicineRequest request) {

        if (medicineRepository.existsByName(request.getName())) {
            throw new RuntimeException("Medicine already exists");
        }

        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .manufacturer(request.getManufacturer())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .active(request.isActive())
                .build();

        return toResponse(medicineRepository.save(medicine));
    }

    public List<MedicineResponse> getAllMedicines() {

        return medicineRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public MedicineResponse getMedicineById(Long id) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        return toResponse(medicine);
    }

    public MedicineResponse updateMedicine(
            Long id,
            MedicineRequest request) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        if (!medicine.getName().equals(request.getName())
                && medicineRepository.existsByName(request.getName())) {

            throw new RuntimeException("Medicine already exists");
        }

        medicine.setName(request.getName());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setDescription(request.getDescription());
        medicine.setPrice(request.getPrice());
        medicine.setStockQuantity(request.getStockQuantity());
        medicine.setActive(request.isActive());

        return toResponse(
                medicineRepository.save(medicine)
        );
    }

    private MedicineResponse toResponse(Medicine medicine) {

        return new MedicineResponse(
                medicine.getId(),
                medicine.getName(),
                medicine.getManufacturer(),
                medicine.getDescription(),
                medicine.getPrice(),
                medicine.getStockQuantity(),
                medicine.isActive()
        );
    }
}