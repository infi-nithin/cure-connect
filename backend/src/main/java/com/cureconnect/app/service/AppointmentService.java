package com.cureconnect.app.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.entity.Appointment;
import com.cureconnect.app.entity.Patient;
import com.cureconnect.app.entity.Slot;
import com.cureconnect.app.exception.InvalidRequestException;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.exception.SlotAlreadyBookedException;
import com.cureconnect.app.repository.AppointmentRepository;
import com.cureconnect.app.repository.PatientRepository;
import com.cureconnect.app.repository.SlotRepository;
import com.cureconnect.app.utils.AppointmentStatus;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SlotRepository slotRepository;
    private final PatientRepository patientRepository;
    private final EntityManager entityManager;

    @Transactional
    public Appointment createAppointment(UUID patientId, UUID slotId) {
        // Find the patient first.
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        // --- CRITICAL SECTION: CONCURRENCY CONTROL ---
        // Lock the Slot row to prevent concurrent booking attempts.
        Slot slot = entityManager.find(Slot.class, slotId, LockModeType.PESSIMISTIC_WRITE);

        if (slot == null) {
            throw new ResourceNotFoundException("Slot not found with id: " + slotId);
        }
        if (slot.isBooked()) {
            throw new SlotAlreadyBookedException("Slot " + slot.getId() + " is already booked.");
        }

        // 1. Mark the slot as booked
        slot.setBooked(true);
        slotRepository.save(slot); 
        
        // 2. Create and save the new appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setSlot(slot);
        appointment.setStatus(AppointmentStatus.BOOKED);

        return appointmentRepository.save(appointment);
    }

    @Transactional(readOnly = true)
    public Appointment getAppointmentById(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByPatient(UUID patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByDoctor(UUID doctorId) {
        return appointmentRepository.findBySlotDoctorId(doctorId);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByPatientAndStatus(UUID patientId, AppointmentStatus status) {
        return appointmentRepository.findByPatientIdAndStatus(patientId, status);
    }

    @Transactional
    public Appointment cancelAppointment(UUID appointmentId) {
        Appointment appointment = getAppointmentById(appointmentId);

        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new InvalidRequestException("Cannot cancel an appointment that is already " + appointment.getStatus());
        }

        // Lock the slot to safely mark it as 'not booked'
        Slot slot = entityManager.find(Slot.class, appointment.getSlot().getId(), LockModeType.PESSIMISTIC_WRITE);
        if (slot == null) {
            throw new ResourceNotFoundException("Associated slot not found");
        }
        slot.setBooked(false);
        slotRepository.save(slot);

        appointment.setStatus(AppointmentStatus.CANCELLED);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment completeAppointment(UUID appointmentId) {
        Appointment appointment = getAppointmentById(appointmentId);

        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new InvalidRequestException("Cannot complete an appointment that is not in 'BOOKED' status.");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public void deleteAppointment(UUID appointmentId) {
        Appointment appointment = getAppointmentById(appointmentId);

        Slot slot = entityManager.find(Slot.class, appointment.getSlot().getId(), LockModeType.PESSIMISTIC_WRITE);
        
        if (slot != null) {
            slot.setBooked(false);
            slotRepository.save(slot);
        }

        appointmentRepository.delete(appointment);
    }
}