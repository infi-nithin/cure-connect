package com.cureconnect.app.service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.entity.Doctor;
import com.cureconnect.app.entity.Role;
import com.cureconnect.app.entity.User;
import com.cureconnect.app.exception.InvalidRequestException;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.repository.DoctorRepository;
import com.cureconnect.app.repository.RoleRepository;
import com.cureconnect.app.repository.UserRepository;
import com.cureconnect.app.utils.BCryptUtils;
import com.cureconnect.app.utils.UserRole;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptUtils bCryptUtils;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(UUID id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    public Doctor getDoctorByUserId(UUID userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for user id: " + userId));
    }
    
    @Transactional
    public Doctor createDoctorProfile(String firstName, String lastName, String email, String password, String licenseId, String specialty) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new InvalidRequestException("User with email already exists: " + email);
        }
        if (doctorRepository.findByLicenseId(licenseId).isPresent()) {
            throw new InvalidRequestException("Doctor profile with license ID already exists: " + licenseId);
        }
        
        Role doctorRole = roleRepository.findByName(UserRole.DOCTOR.name())
                .orElseThrow(() -> new ResourceNotFoundException("Required Role DOCTOR not found in database."));

        User newUser = new User();
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setEmail(email);
        newUser.setPasswordHash(bCryptUtils.hashPassword(password));
        newUser.setRoles(Collections.singletonList(doctorRole));
        newUser.setEnabled(true);
        
        User savedUser = userRepository.save(newUser);

        Doctor doctor = new Doctor();
        doctor.setUser(savedUser); 
        doctor.setLicenseId(licenseId);
        doctor.setSpecialty(specialty);

        return doctorRepository.save(doctor);
    }
    
    @Transactional
    public Doctor updateDoctorProfile(UUID id, String specialty) {
        Doctor doctor = getDoctorById(id);
        doctor.setSpecialty(specialty); 

        return doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(UUID id) {
        Doctor doctor = getDoctorById(id); 
        User userToDelete = doctor.getUser();
        
        doctorRepository.delete(doctor);
        userRepository.delete(userToDelete);
    }
}