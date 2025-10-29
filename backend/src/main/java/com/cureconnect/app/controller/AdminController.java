package com.cureconnect.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cureconnect.app.dto.AdminStats;
import com.cureconnect.app.dto.DetailedAdminStats;
import com.cureconnect.app.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getDashboardStats() {
        AdminStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/stats/detailed")
    public ResponseEntity<DetailedAdminStats> getDetailedStats() {
        DetailedAdminStats stats = adminService.getDetailedStats();
        return ResponseEntity.ok(stats);
    }
}