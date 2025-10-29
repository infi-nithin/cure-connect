package com.cureconnect.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.cureconnect.app.entity.Appointment;
import com.cureconnect.app.utils.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Optional<Appointment> findBySlotId(UUID slotId);

    List<Appointment> findByPatientId(UUID patientId);

    List<Appointment> findByPatientIdAndStatus(UUID patientId, AppointmentStatus status);

    List<Appointment> findBySlotDoctorId(UUID doctorId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = 'BOOKED'")
    Long countActiveAppointments();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = 'COMPLETED'")
    Long countCompletedAppointments();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = 'CANCELLED'")
    Long countCancelledAppointments();
}
