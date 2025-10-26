package com.cureconnect.app.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cureconnect.app.entity.Prescription;
import com.cureconnect.app.service.PrescriptionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    
    @PostMapping
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<Prescription> createPrescription(@RequestBody Map<String, Object> requestBody) {
        
        String patientIdStr = (String) requestBody.get("patientId");
        String doctorIdStr = (String) requestBody.get("doctorId");
        String dosage = (String) requestBody.get("dosage");
        String instructions = (String) requestBody.get("instructions");
        
        List<String> medicineIdStrs = (List<String>) requestBody.get("medicineIds");
        
        if (patientIdStr == null || doctorIdStr == null || medicineIdStrs == null || medicineIdStrs.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Simple validation
        }

        List<UUID> medicineIds = medicineIdStrs.stream()
            .map(UUID::fromString)
            .collect(Collectors.toList());

        Prescription newPrescription = prescriptionService.createPrescription(
            UUID.fromString(patientIdStr), 
            UUID.fromString(doctorIdStr), 
            dosage, 
            instructions, 
            medicineIds
        );
        return new ResponseEntity<>(newPrescription, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or @securityService.isPrescriptionOwner(#id) or @securityService.isPrescriptionDoctor(#id)")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable UUID id) {
        Prescription prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(prescription);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('ADMIN') or (hasAuthority('PATIENT') and @securityService.isPatientOwner(#patientId))")
    public ResponseEntity<List<Prescription>> getPrescriptionsByPatient(@PathVariable UUID patientId) {
        List<Prescription> prescriptions = prescriptionService.getPrescriptionsByPatient(patientId);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAuthority('ADMIN') or (hasAuthority('DOCTOR') and @securityService.isDoctorOwner(#doctorId))")
    public ResponseEntity<List<Prescription>> getPrescriptionsByDoctor(@PathVariable UUID doctorId) {
        List<Prescription> prescriptions = prescriptionService.getPrescriptionsByDoctor(doctorId);
        return ResponseEntity.ok(prescriptions);
    }
}