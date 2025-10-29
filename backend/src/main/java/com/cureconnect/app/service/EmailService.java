package com.cureconnect.app.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.cureconnect.app.entity.Appointment;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    @Async
    public void sendAppointmentConfirmation(Appointment appointment) {
        String to = appointment.getPatient().getUser().getEmail();
        String subject = "Appointment Confirmation";
        String text = String.format(
            "Dear %s,\n\nYour appointment with Dr. %s has been confirmed.\n\nDate: %s\nTime: %s\n\nThank you for choosing CureConnect.",
            appointment.getPatient().getUser().getEmail(), // Using email as name for now
            appointment.getSlot().getDoctor().getUser().getEmail(), // Using email as name for now
            appointment.getSlot().getStartTime().toLocalDate(),
            appointment.getSlot().getStartTime().toLocalTime()
        );
        sendEmail(to, subject, text);
    }

    @Async
    public void sendAppointmentCancellation(Appointment appointment) {
        String to = appointment.getPatient().getUser().getEmail();
        String subject = "Appointment Cancellation";
        String text = String.format(
            "Dear %s,\n\nYour appointment with Dr. %s on %s at %s has been cancelled.\n\nWe apologize for any inconvenience.",
            appointment.getPatient().getUser().getEmail(), // Using email as name for now
            appointment.getSlot().getDoctor().getUser().getEmail(), // Using email as name for now
            appointment.getSlot().getStartTime().toLocalDate(),
            appointment.getSlot().getStartTime().toLocalTime()
        );
        sendEmail(to, subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@cureconnect.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        emailSender.send(message);
    }
}
