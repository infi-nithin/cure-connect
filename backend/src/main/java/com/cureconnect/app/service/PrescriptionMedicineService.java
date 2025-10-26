package com.cureconnect.app.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.entity.PrescriptionMedicine;
import com.cureconnect.app.entity.PrescriptionMedicineId;
import com.cureconnect.app.exception.InvalidRequestException;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.repository.PrescriptionMedicineRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrescriptionMedicineService {

    private final PrescriptionMedicineRepository prescriptionMedicineRepository;

    public List<PrescriptionMedicine> getMedicinesByPrescriptionId(UUID prescriptionId) {
        return prescriptionMedicineRepository.findByIdPrescriptionId(prescriptionId);
    }

    public List<PrescriptionMedicine> getPrescriptionsByMedicineId(UUID medicineId) {
        return prescriptionMedicineRepository.findByIdMedicineId(medicineId);
    }

    @Transactional
    public void deletePrescriptionMedicineLink(UUID prescriptionId, UUID medicineId) {
        PrescriptionMedicineId id = new PrescriptionMedicineId(prescriptionId, medicineId);
        
        if (!prescriptionMedicineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Prescription-Medicine link not found for prescriptionId: " + prescriptionId + " and medicineId: " + medicineId);
        }
        prescriptionMedicineRepository.deleteById(id);
    }

    @Transactional
    public PrescriptionMedicine updateQuantity(UUID prescriptionId, UUID medicineId, int newQuantity) {
        PrescriptionMedicineId id = new PrescriptionMedicineId(prescriptionId, medicineId);
        
        PrescriptionMedicine link = prescriptionMedicineRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Prescription-Medicine link not found for update."));

        if (newQuantity <= 0) {
            throw new InvalidRequestException("Quantity must be a positive integer.");
        }
        
        link.setQuantity(newQuantity);
        return prescriptionMedicineRepository.save(link);
    }
}