package com.cureconnect.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DetailedAdminStats {
    private Long totalUsers;
    private Long totalDoctors;
    private Long totalPatients;
    private Long bookedAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Long totalAppointments;
}
