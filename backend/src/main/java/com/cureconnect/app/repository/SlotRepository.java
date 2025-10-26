package com.cureconnect.app.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cureconnect.app.entity.Slot;

@Repository
public interface SlotRepository extends JpaRepository<Slot, UUID> {

    List<Slot> findByDoctorId(UUID doctorId);

    List<Slot> findByDoctorIdAndIsBooked(UUID doctorId, boolean isBooked);

    List<Slot> findByDoctorIdAndStartTimeBetween(UUID doctorId, LocalDateTime start, LocalDateTime end);
}