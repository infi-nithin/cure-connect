package com.cureconnect.app.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.dto.AdminStats;
import com.cureconnect.app.dto.DetailedAdminStats;
import com.cureconnect.app.repository.AppointmentRepository;
import com.cureconnect.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {
    
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    
    public AdminStats getDashboardStats() {
        Long totalUsers = userRepository.countActiveUsers();
        Long totalDoctors = userRepository.countActiveDoctors();
        Long totalPatients = userRepository.countActivePatients();
        Long totalAppointments = appointmentRepository.countActiveAppointments();
        
        return new AdminStats(
            totalUsers != null ? totalUsers : 0L,
            totalDoctors != null ? totalDoctors : 0L,
            totalPatients != null ? totalPatients : 0L,
            totalAppointments != null ? totalAppointments : 0L
        );
    }
    
    public DetailedAdminStats getDetailedStats() {
        Long totalUsers = userRepository.countActiveUsers();
        Long totalDoctors = userRepository.countActiveDoctors();
        Long totalPatients = userRepository.countActivePatients();
        Long bookedAppointments = appointmentRepository.countActiveAppointments();
        Long completedAppointments = appointmentRepository.countCompletedAppointments();
        Long cancelledAppointments = appointmentRepository.countCancelledAppointments();
        
        Long totalAppointments = (bookedAppointments != null ? bookedAppointments : 0L) +
                                (completedAppointments != null ? completedAppointments : 0L) +
                                (cancelledAppointments != null ? cancelledAppointments : 0L);
        
        return new DetailedAdminStats(
            totalUsers != null ? totalUsers : 0L,
            totalDoctors != null ? totalDoctors : 0L,
            totalPatients != null ? totalPatients : 0L,
            bookedAppointments != null ? bookedAppointments : 0L,
            completedAppointments != null ? completedAppointments : 0L,
            cancelledAppointments != null ? cancelledAppointments : 0L,
            totalAppointments
        );
    }
}