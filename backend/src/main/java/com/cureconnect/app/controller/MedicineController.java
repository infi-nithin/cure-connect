package com.cureconnect.app.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cureconnect.app.entity.Medicine;
import com.cureconnect.app.service.MedicineService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable UUID id) {
        Medicine medicine = medicineService.getMedicineById(id);
        return ResponseEntity.ok(medicine);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        List<Medicine> medicines = medicineService.getAllMedicines();
        return ResponseEntity.ok(medicines);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<List<Medicine>> searchMedicinesByName(@RequestParam String name) {
        List<Medicine> medicines = medicineService.searchMedicinesByName(name);
        return ResponseEntity.ok(medicines);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Medicine> createMedicine(@RequestBody Map<String, String> requestBody) {
        String name = requestBody.get("name");
        String dosageForm = requestBody.get("dosageForm");
        String description = requestBody.get("description");
        UUID doctorId = UUID.fromString(requestBody.get("doctorId"));

        if (name == null || dosageForm == null || doctorId == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); 
        }

        Medicine newMedicine = medicineService.createMedicine(
            name,
            dosageForm,
            description,
            doctorId
        );
        return new ResponseEntity<>(newMedicine, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable UUID id, @RequestBody Map<String, String> requestBody) {
        
        String name = requestBody.get("name");
        String dosageForm = requestBody.get("dosageForm");
        String description = requestBody.get("description");
        UUID doctorId = UUID.fromString(requestBody.get("doctorId"));
        
        if (name == null || dosageForm == null || doctorId == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); 
        }

        Medicine updatedMedicine = medicineService.updateMedicine(
            id,
            name,
            dosageForm,
            description,
            doctorId
        );
        return ResponseEntity.ok(updatedMedicine);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteMedicine(@PathVariable UUID id) {
        medicineService.deleteMedicine(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}