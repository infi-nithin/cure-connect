package com.cureconnect.app.service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.entity.Patient;
import com.cureconnect.app.entity.Role;
import com.cureconnect.app.entity.User;
import com.cureconnect.app.exception.InvalidRequestException;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.repository.PatientRepository;
import com.cureconnect.app.repository.RoleRepository;
import com.cureconnect.app.repository.UserRepository;
import com.cureconnect.app.utils.BCryptUtils;
import com.cureconnect.app.utils.UserRole;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptUtils bCryptUtils;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(UUID id) {
        return patientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    public Patient getPatientByUserId(UUID userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for user id: " + userId));
    }

    @Transactional
    public Patient createPatientProfile(String email, String password, LocalDate dob, String phoneNumber) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new InvalidRequestException("User with email already exists: " + email);
        }
        
        Role patientRole = roleRepository.findByName(UserRole.PATIENT.name())
                .orElseThrow(() -> new ResourceNotFoundException("Required Role PATIENT not found in database."));

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPasswordHash(bCryptUtils.hashPassword(password));
        newUser.setRoles(Collections.singletonList(patientRole));
        newUser.setEnabled(true);
        
        User savedUser = userRepository.save(newUser);
        Patient patient = new Patient();
        patient.setUser(savedUser);
        patient.setDob(dob);
        patient.setPhoneNumber(phoneNumber);

        return patientRepository.save(patient);
    }

    @Transactional
    public Patient updatePatientProfile(UUID id, LocalDate dob, String phoneNumber) {
        Patient patient = getPatientById(id);
        if (dob != null) {
            patient.setDob(dob);
        }
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            patient.setPhoneNumber(phoneNumber);
        }

        return patientRepository.save(patient);
    }
    
    @Transactional
    public void deletePatient(UUID id) {
        Patient patient = getPatientById(id);
        
        User userToDelete = patient.getUser();
        
        patientRepository.delete(patient);
        userRepository.delete(userToDelete);
    }
}