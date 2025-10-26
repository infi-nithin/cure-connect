package com.cureconnect.app.service;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.entity.Doctor;
import com.cureconnect.app.entity.Medicine;
import com.cureconnect.app.exception.InvalidRequestException;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.repository.DoctorRepository;
import com.cureconnect.app.repository.MedicineRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final DoctorRepository doctorRepository;

    public Medicine getMedicineById(UUID id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public List<Medicine> searchMedicinesByName(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name);
    }
    
    @Transactional
    public Medicine createMedicine(String name, String dosageForm, String description, UUID doctorId) {
        if (medicineRepository.findByName(name).isPresent()) {
            throw new InvalidRequestException("Medicine with name '" + name + "' already exists.");
        }
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        Medicine medicine = new Medicine();
        medicine.setName(name);
        medicine.setDosageForm(dosageForm);
        medicine.setDescription(description);
        medicine.setUpdatedBy(doctor);
        
        return medicineRepository.save(medicine);
    }
    
    @Transactional
    public Medicine updateMedicine(UUID id, String name, String dosageForm, String description, UUID doctorId) {
        Medicine medicine = getMedicineById(id);
        
        Optional<Medicine> existingMedicine = medicineRepository.findByName(name);
        if (existingMedicine.isPresent() && !existingMedicine.get().getId().equals(id)) {
             throw new InvalidRequestException("Medicine name '" + name + "' is already in use by another entry.");
        }
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        medicine.setName(name);
        medicine.setDosageForm(dosageForm);
        medicine.setDescription(description);
        medicine.setUpdatedBy(doctor);
        
        return medicineRepository.save(medicine);
    }
    
    @Transactional
    public void deleteMedicine(UUID id) {
        if (!medicineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medicine not found with id: " + id);
        }
        medicineRepository.deleteById(id);
    }
}