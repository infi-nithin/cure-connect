package com.cureconnect.app.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.entity.Doctor;
import com.cureconnect.app.entity.Medicine;
import com.cureconnect.app.entity.Patient;
import com.cureconnect.app.entity.Prescription;
import com.cureconnect.app.entity.PrescriptionMedicine;
import com.cureconnect.app.entity.PrescriptionMedicineId;
import com.cureconnect.app.exception.InvalidRequestException;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.repository.DoctorRepository;
import com.cureconnect.app.repository.MedicineRepository;
import com.cureconnect.app.repository.PatientRepository;
import com.cureconnect.app.repository.PrescriptionMedicineRepository;
import com.cureconnect.app.repository.PrescriptionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionMedicineRepository prescriptionMedicineRepository;

    @Transactional
    public Prescription createPrescription(
            UUID patientId,
            UUID doctorId,
            String dosage,
            String instructions,
            List<UUID> medicineIds) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));

        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setDosage(dosage);
        prescription.setInstructions(instructions);

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        List<PrescriptionMedicine> prescriptionMedicines = new ArrayList<>();

        List<Medicine> foundMedicines = medicineRepository.findAllById(medicineIds);
        if (foundMedicines.size() != medicineIds.size()) {
            throw new InvalidRequestException("One or more medicine IDs were invalid.");
        }

        for (Medicine med : foundMedicines) {
            PrescriptionMedicine pm = new PrescriptionMedicine();
            pm.setId(new PrescriptionMedicineId(savedPrescription.getId(), med.getId()));
            pm.setPrescription(savedPrescription);
            pm.setMedicine(med);
            pm.setQuantity(1);

            prescriptionMedicines.add(pm);
        }

        prescriptionMedicineRepository.saveAll(prescriptionMedicines);
        savedPrescription.setMedicines(prescriptionMedicines);
        return savedPrescription;
    }

    public Prescription getPrescriptionById(UUID id) {
        return prescriptionRepository.findByIdWithMedicines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));
    }

    public List<Prescription> getPrescriptionsByPatient(UUID patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    public List<Prescription> getPrescriptionsByDoctor(UUID doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }
}
