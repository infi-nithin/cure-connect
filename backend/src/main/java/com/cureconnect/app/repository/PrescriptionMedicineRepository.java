package com.cureconnect.app.repository;

import com.cureconnect.app.entity.PrescriptionMedicine;
import com.cureconnect.app.entity.PrescriptionMedicineId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrescriptionMedicineRepository extends JpaRepository<PrescriptionMedicine, PrescriptionMedicineId> {

    List<PrescriptionMedicine> findByIdPrescriptionId(UUID prescriptionId);

    List<PrescriptionMedicine> findByIdMedicineId(UUID medicineId);
}