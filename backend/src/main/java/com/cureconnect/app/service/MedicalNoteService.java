package com.cureconnect.app.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.entity.Appointment;
import com.cureconnect.app.entity.Doctor;
import com.cureconnect.app.entity.MedicalNote;
import com.cureconnect.app.exception.InvalidRequestException;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.repository.AppointmentRepository;
import com.cureconnect.app.repository.DoctorRepository;
import com.cureconnect.app.repository.MedicalNoteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalNoteService {

    private final MedicalNoteRepository medicalNoteRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    public MedicalNote getNoteByAppointmentId(UUID appointmentId) {
        return medicalNoteRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical note not found for appointment: " + appointmentId));
    }

    @Transactional
    public MedicalNote createNote(UUID appointmentId, String notesText, UUID doctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));
        
        // Ensure only one note per appointment (based on OneToOne relationship in entity)
        Optional<MedicalNote> existingNote = medicalNoteRepository.findByAppointmentId(appointmentId);
        if (existingNote.isPresent()) {
            throw new InvalidRequestException("A medical note for this appointment already exists.");
        }

        MedicalNote note = new MedicalNote();
        note.setAppointment(appointment);
        note.setNotesText(notesText);
        note.setUpdatedBy(doctor);
        
        return medicalNoteRepository.save(note);
    }

    @Transactional
    public MedicalNote updateNote(UUID noteId, String notesText, UUID doctorId) {
        MedicalNote note = medicalNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical note not found: " + noteId));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));

        note.setNotesText(notesText);
        note.setUpdatedBy(doctor);
        
        return medicalNoteRepository.save(note);
    }
    
    @Transactional
    public void deleteNote(UUID noteId) {
        if (!medicalNoteRepository.existsById(noteId)) {
            throw new ResourceNotFoundException("Medical note not found for deletion: " + noteId);
        }
        medicalNoteRepository.deleteById(noteId);
    }
}