package com.cureconnect.app.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cureconnect.app.entity.Slot;
import com.cureconnect.app.service.SlotService;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Slot> getSlotById(@PathVariable UUID id) {
        Slot slot = slotService.getSlotById(id);
        return ResponseEntity.ok(slot);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<List<Slot>> getSlotsByDoctor(@PathVariable UUID doctorId,
            @RequestParam(defaultValue = "false") boolean availableOnly) {

        if (availableOnly) {
            return ResponseEntity.ok(slotService.getAvailableSlotsByDoctor(doctorId));
        }
        return ResponseEntity.ok(slotService.getSlotsByDoctor(doctorId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<Slot> createSlot(
            @RequestParam UUID doctorId,
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

        Slot newSlot = slotService.createSlot(doctorId, startTime, endTime);
        return new ResponseEntity<>(newSlot, HttpStatus.CREATED);
    }

    @PutMapping("/{slotId}")
    @PreAuthorize("hasAuthority('DOCTOR') and @securityService.isSlotDoctor(#slotId)")
    public ResponseEntity<Slot> updateSlotTime(
            @PathVariable UUID slotId,
            @RequestBody Map<String, String> requestBody) {

        LocalDateTime newStart = LocalDateTime.parse(requestBody.get("startTime"));
        LocalDateTime newEnd = LocalDateTime.parse(requestBody.get("endTime"));

        Slot updatedSlot = slotService.updateSlotTime(slotId, newStart, newEnd);
        return ResponseEntity.ok(updatedSlot);
    }

    @DeleteMapping("/{slotId}")
    @PreAuthorize("hasAuthority('DOCTOR') and @securityService.isSlotDoctor(#slotId)")
    public ResponseEntity<Void> deleteSlot(@PathVariable UUID slotId) {
        slotService.deleteSlot(slotId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
