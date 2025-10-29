package com.cureconnect.app.service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.dto.UserDto;
import com.cureconnect.app.entity.Role;
import com.cureconnect.app.entity.User;
import com.cureconnect.app.exception.InvalidRequestException;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.repository.RoleRepository;
import com.cureconnect.app.repository.UserRepository;
import com.cureconnect.app.utils.BCryptUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptUtils bCryptUtils;

    private UserDto toDto(User user) {
        return new UserDto(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public UserDto getUserDtoById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toDto(user);
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
    
    public UserDto getUserDtoByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toDto(user);
    }

    @Transactional
    public UserDto createUser(String firstName, String lastName, String email, String password, String defaultRoleName) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new InvalidRequestException("User with email already exists: " + email);
        }

        Role defaultRole = roleRepository.findByName(defaultRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Required Role " + defaultRoleName + " not found in database."));
        
        User newUser = new User();
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setEmail(email);
        newUser.setPasswordHash(bCryptUtils.hashPassword(password));
        newUser.setRoles(Collections.singletonList(defaultRole));
        newUser.setEnabled(true);
        
        User savedUser = userRepository.save(newUser);
        return toDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(UUID id, Boolean enabled, String newEmail, String firstName, String lastName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (enabled != null) {
            user.setEnabled(enabled);
        }
        
        if (newEmail != null && !newEmail.isBlank() && !newEmail.equals(user.getEmail())) {
            if (userRepository.findByEmail(newEmail).isPresent()) {
                throw new InvalidRequestException("User with new email already exists: " + newEmail);
            }
            user.setEmail(newEmail);
        }

        if (firstName != null && !firstName.isBlank()) {
            user.setFirstName(firstName);
        }

        if (lastName != null && !lastName.isBlank()) {
            user.setLastName(lastName);
        }
        
        User updatedUser = userRepository.save(user);
        return toDto(updatedUser);
    }
    
    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    @Transactional
    public UserDto addRoleToUser(UUID userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        
        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
            user = userRepository.save(user);
        }
        return toDto(user);
    }

    @Transactional
    public UserDto removeRoleFromUser(UUID userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                
        if (user.getRoles().contains(role)) {
            user.getRoles().remove(role);
            user = userRepository.save(user);
        }
        return toDto(user);
    }

    @Transactional
    public UserDto updatePassword(UUID userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setPasswordHash(bCryptUtils.hashPassword(newPassword));
        user = userRepository.save(user);
        return toDto(user);
    }
}