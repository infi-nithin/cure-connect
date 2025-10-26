package com.cureconnect.app.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.cureconnect.app.entity.Role; // Assuming Role entity is safe to expose or has its own DTO

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private UUID id;
    private String email;
    private boolean isEnabled;
    private LocalDateTime createdAt;
    private List<Role> roles;
    
    // Helper constructor to map from the Entity to the DTO
    public UserDto(com.cureconnect.app.entity.User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.isEnabled = user.isEnabled();
        this.createdAt = user.getCreatedAt();
        this.roles = user.getRoles();
    }
}