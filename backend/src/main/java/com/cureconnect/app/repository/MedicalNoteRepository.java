package com.cureconnect.app.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cureconnect.app.entity.MedicalNote;

@Repository
public interface MedicalNoteRepository extends JpaRepository<MedicalNote, UUID> {
    Optional<MedicalNote> findByAppointmentId(UUID appointmentId);
}