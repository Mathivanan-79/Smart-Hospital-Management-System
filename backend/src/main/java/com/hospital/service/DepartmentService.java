package com.hospital.service;

import com.hospital.dto.DepartmentRequest;
import com.hospital.dto.DepartmentResponse;
import com.hospital.entity.Department;
import com.hospital.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {

        if (departmentRepository.existsByName(request.getName())) {
            throw new RuntimeException("Department already exists");
        }

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return toResponse(departmentRepository.save(department));
    }

    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DepartmentResponse getDepartmentById(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        return toResponse(department);
    }
public DepartmentResponse updateDepartment(
        Long id,
        DepartmentRequest request) {

    Department department = departmentRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Department not found"));

    if (!department.getName().equals(request.getName())
            && departmentRepository.existsByName(request.getName())) {

        throw new RuntimeException("Department already exists");
    }

    department.setName(request.getName());
    department.setDescription(request.getDescription());

    return toResponse(
            departmentRepository.save(department)
    );
}
    private DepartmentResponse toResponse(Department department) {

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getDescription()
        );
    }
}