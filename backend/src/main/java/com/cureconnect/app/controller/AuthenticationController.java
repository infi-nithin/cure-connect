package com.cureconnect.app.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cureconnect.app.dto.LoginDto;
import com.cureconnect.app.dto.RegisterDto;
import com.cureconnect.app.dto.UserDto;
import com.cureconnect.app.entity.User;
import com.cureconnect.app.exception.InvalidRequestException;
import com.cureconnect.app.service.JwtService;
import com.cureconnect.app.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(
            @Valid @RequestBody RegisterDto registerDto,
            @RequestParam(defaultValue = "PATIENT") String role) {

        try {
            UserDto newUser = userService.createUser(registerDto.getEmail(), registerDto.getPassword(), role);
            String token = jwtService.generateToken(newUser.getId(), newUser.getEmail(), newUser.getRoles().stream().map(r -> r.getName()).toArray(String[]::new));
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "User registered and logged in successfully.");

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (InvalidRequestException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(@Valid @RequestBody LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        User user = userService.getUserByEmail(loginDto.getEmail());
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRoles().stream().map(r -> r.getName()).toArray(String[]::new));
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login successful.");
        return ResponseEntity.ok(response);
    }
}
