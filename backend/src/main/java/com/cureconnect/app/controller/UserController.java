package com.cureconnect.app.controller;

import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cureconnect.app.dto.UserDto;
import com.cureconnect.app.service.UserService;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or @securityService.isUserOwner(#id)")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID id) {
        UserDto user = userService.getUserDtoById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDto> getUserByEmail(@RequestParam @NotBlank String email) { 
        UserDto user = userService.getUserDtoByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDto> createUser(
            @RequestParam @NotBlank String firstName,
            @RequestParam @NotBlank String lastName,
            @RequestParam @NotBlank String email,
            @RequestParam @NotBlank String password,
            @RequestParam(defaultValue = "PATIENT") String defaultRole) {

        UserDto newUser = userService.createUser(firstName, lastName, email, password, defaultRole);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> requestBody) {
        Boolean enabled = requestBody.containsKey("enabled") ? (Boolean) requestBody.get("enabled") : null;
        String newEmail = (String) requestBody.get("email");
        String firstName = (String) requestBody.get("firstName");
        String lastName = (String) requestBody.get("lastName");

        UserDto updatedUser = userService.updateUser(id, enabled, newEmail, firstName, lastName);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasAuthority('ADMIN') or @securityService.isUserOwner(#id)")
    public ResponseEntity<UserDto> updatePassword(
            @PathVariable UUID id,
            @RequestBody Map<String, String> requestBody) {

        String newPassword = requestBody.get("newPassword");

        if (newPassword == null || newPassword.isBlank()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        UserDto updatedUser = userService.updatePassword(id, newPassword);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{userId}/roles")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDto> addRoleToUser(
            @PathVariable UUID userId,
            @RequestParam @NotBlank String roleName) {

        UserDto user = userService.addRoleToUser(userId, roleName);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{userId}/roles")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDto> removeRoleFromUser(
            @PathVariable UUID userId,
            @RequestParam @NotBlank String roleName) {

        UserDto user = userService.removeRoleFromUser(userId, roleName);
        return ResponseEntity.ok(user);
    }
}