package com.cureconnect.app.repository;

import com.cureconnect.app.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    List<Prescription> findByPatientId(UUID patientId);

    List<Prescription> findByDoctorId(UUID doctorId);

    @Query("SELECT p FROM Prescription p LEFT JOIN FETCH p.medicines WHERE p.id = :id")
    Optional<Prescription> findByIdWithMedicines(UUID id);
}