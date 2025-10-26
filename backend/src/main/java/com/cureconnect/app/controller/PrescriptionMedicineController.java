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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cureconnect.app.entity.PrescriptionMedicine;
import com.cureconnect.app.service.PrescriptionMedicineService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/prescription-medicines")
@RequiredArgsConstructor
public class PrescriptionMedicineController {

    private final PrescriptionMedicineService prescriptionMedicineService;

    @GetMapping("/prescription/{prescriptionId}")
    @PreAuthorize("hasAuthority('ADMIN') or @securityService.isPrescriptionOwner(#prescriptionId) or @securityService.isPrescriptionDoctor(#prescriptionId)")
    public ResponseEntity<List<PrescriptionMedicine>> getMedicinesByPrescriptionId(@PathVariable UUID prescriptionId) {
        List<PrescriptionMedicine> medicines = prescriptionMedicineService.getMedicinesByPrescriptionId(prescriptionId);
        return ResponseEntity.ok(medicines);
    }

    @GetMapping("/medicine/{medicineId}")
    @PreAuthorize("hasAuthority('ADMIN')") // Restrict finding prescriptions by medicine to admin/inventory staff
    public ResponseEntity<List<PrescriptionMedicine>> getPrescriptionsByMedicineId(@PathVariable UUID medicineId) {
        List<PrescriptionMedicine> prescriptions = prescriptionMedicineService.getPrescriptionsByMedicineId(medicineId);
        return ResponseEntity.ok(prescriptions);
    }

    @PutMapping("/{prescriptionId}/{medicineId}")
    @PreAuthorize("hasAuthority('ADMIN') or @securityService.isPrescriptionDoctor(#prescriptionId)")
    public ResponseEntity<PrescriptionMedicine> updateQuantity(
            @PathVariable UUID prescriptionId,
            @PathVariable UUID medicineId,
            @RequestBody Map<String, Integer> requestBody) {
        
        Integer newQuantity = requestBody.get("quantity");
        
        if (newQuantity == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        PrescriptionMedicine updatedLink = prescriptionMedicineService.updateQuantity(prescriptionId, medicineId, newQuantity);
        return ResponseEntity.ok(updatedLink);
    }

    @DeleteMapping("/{prescriptionId}/{medicineId}")
    @PreAuthorize("hasAuthority('ADMIN') or @securityService.isPrescriptionDoctor(#prescriptionId)")
    public ResponseEntity<Void> deletePrescriptionMedicineLink(
            @PathVariable UUID prescriptionId,
            @PathVariable UUID medicineId) {
        
        prescriptionMedicineService.deletePrescriptionMedicineLink(prescriptionId, medicineId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}