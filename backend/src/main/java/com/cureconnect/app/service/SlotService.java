package com.cureconnect.app.service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.entity.Doctor;
import com.cureconnect.app.entity.Slot;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.exception.SlotAlreadyBookedException;
import com.cureconnect.app.repository.DoctorRepository;
import com.cureconnect.app.repository.SlotRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;
    private final EntityManager entityManager;

    public Slot getSlotById(UUID id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + id));
    }

    public List<Slot> getSlotsByDoctor(UUID doctorId) {
        return slotRepository.findByDoctorId(doctorId);
    }

    public List<Slot> getAvailableSlotsByDoctor(UUID doctorId) {
        return slotRepository.findByDoctorIdAndIsBooked(doctorId, false);
    }

    @Transactional
    public Slot createSlot(UUID doctorId, LocalDateTime startTime, LocalDateTime endTime) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        Slot slot = new Slot();
        slot.setDoctor(doctor);
        slot.setStartTime(startTime);
        slot.setEndTime(endTime);
        slot.setBooked(false); 
        
        return slotRepository.save(slot);
    }
    
    @Transactional
    public Slot updateSlotTime(UUID slotId, LocalDateTime newStart, LocalDateTime newEnd) {
        Slot slot = entityManager.find(Slot.class, slotId, LockModeType.PESSIMISTIC_WRITE);

        if (slot == null) {
            throw new ResourceNotFoundException("Slot not found with id: " + slotId);
        }

        if (slot.isBooked()) {
            throw new SlotAlreadyBookedException("Cannot update time for a slot that is already booked.");
        }

        slot.setStartTime(newStart);
        slot.setEndTime(newEnd);
        return slotRepository.save(slot);
    }

    @Transactional
    public void deleteSlot(UUID slotId) {
        Slot slot = entityManager.find(Slot.class, slotId, LockModeType.PESSIMISTIC_WRITE);

        if (slot == null) {
            throw new ResourceNotFoundException("Slot not found with id: " + slotId);
        }

        if (slot.isBooked()) {
            throw new SlotAlreadyBookedException("Cannot delete a slot that is already booked.");
        }
        
        slotRepository.delete(slot);
    }
}