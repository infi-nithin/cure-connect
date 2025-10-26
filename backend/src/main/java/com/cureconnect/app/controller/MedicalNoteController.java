package com.cureconnect.app.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cureconnect.app.entity.MedicalNote;
import com.cureconnect.app.service.MedicalNoteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/medical-notes")
@RequiredArgsConstructor
public class MedicalNoteController {

    private final MedicalNoteService medicalNoteService;

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR') or (hasAuthority('PATIENT') and @securityService.isAppointmentOwner(#appointmentId))")
    public ResponseEntity<MedicalNote> getNoteByAppointmentId(@PathVariable UUID appointmentId) {
        MedicalNote note = medicalNoteService.getNoteByAppointmentId(appointmentId);
        return ResponseEntity.ok(note);
    }

    @PostMapping("/{appointmentId}")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<MedicalNote> createNote(
            @PathVariable UUID appointmentId,
            @RequestBody Map<String, String> requestBody) {

        String notesText = requestBody.get("notesText");
        String doctorIdStr = requestBody.get("doctorId");

        MedicalNote newNote = medicalNoteService.createNote(
                appointmentId,
                notesText,
                UUID.fromString(doctorIdStr)
        );
        return new ResponseEntity<>(newNote, HttpStatus.CREATED);
    }

    @PutMapping("/{noteId}")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<MedicalNote> updateNote(
            @PathVariable UUID noteId,
            @RequestBody Map<String, String> requestBody) {

        String notesText = requestBody.get("notesText");
        String doctorIdStr = requestBody.get("doctorId");

        MedicalNote updatedNote = medicalNoteService.updateNote(
                noteId,
                notesText,
                UUID.fromString(doctorIdStr)
        );
        return ResponseEntity.ok(updatedNote);
    }

    @DeleteMapping("/{noteId}")
    @PreAuthorize("hasAnyAuthority('DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteNote(@PathVariable UUID noteId) {
        medicalNoteService.deleteNote(noteId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
