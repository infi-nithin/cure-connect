import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { Doctor } from '../../../core/models/doctor.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  todayAppointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  loading = true;
  error = '';
  currentUser: User | null;
  currentDoctor: Doctor | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';
    
    if (!this.currentUser) {
      this.loading = false;
      this.error = 'Could not identify current user. Please log in again.';
      return;
    }

    // First get doctor profile
    this.doctorService.getDoctorByUserId(this.currentUser.id).subscribe({
      next: (doctor) => {
        this.currentDoctor = doctor;
        this.loadTodayAppointments(doctor.id);
        this.loadUpcomingAppointments(doctor.id);
      },
      error: (error) => {
        console.error('Error loading doctor profile:', error);
        this.error = 'Failed to load doctor profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  private loadTodayAppointments(doctorId: string): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.appointmentService.getAppointmentsByDoctor(doctorId).subscribe({
      next: (appointments) => {
        this.todayAppointments = appointments
          .filter(appointment => {
            const appointmentDate = new Date(appointment.slot.startTime);
            return appointmentDate >= today && appointmentDate < tomorrow && 
                   appointment.status === AppointmentStatus.BOOKED;
          })
          .sort((a, b) => new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime());
      },
      error: (error) => {
        console.error('Error loading today appointments:', error);
        this.error = 'Failed to load today\'s appointments.';
      }
    });
  }

  private loadUpcomingAppointments(doctorId: string): void {
    this.appointmentService.getAppointmentsByDoctor(doctorId).subscribe({
      next: (appointments) => {
        const now = new Date();
        this.upcomingAppointments = appointments
          .filter(appointment => 
            new Date(appointment.slot.startTime) > now && 
            appointment.status === AppointmentStatus.BOOKED
          )
          .sort((a, b) => new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime());
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
        this.error = 'Failed to load upcoming appointments.';
        this.loading = false;
      }
    });
  }

  // Helper methods for template
  getPatientName(appointment: Appointment): string {
    if (appointment.patient.user.firstName && appointment.patient.user.lastName) {
      return `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
    }
    return appointment.patient.user.email.split('@')[0]; // Fallback to email username
  }

  getAppointmentTime(appointment: Appointment): Date {
    return new Date(appointment.slot.startTime);
  }

  getAppointmentEndTime(appointment: Appointment): Date {
    return new Date(appointment.slot.endTime);
  }

  getStatusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.BOOKED:
        return 'bg-primary';
      case AppointmentStatus.COMPLETED:
        return 'bg-success';
      case AppointmentStatus.CANCELED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  // Safe getter methods for template
  getCurrentUserName(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return this.currentUser?.email?.split('@')[0] || 'Doctor';
  }

  getDoctorSpecialty(): string {
    return this.currentDoctor?.specialty || 'Not specified';
  }

  getDoctorLicense(): string {
    return this.currentDoctor?.licenseId || 'Not available';
  }

  getPatientPhoneNumber(appointment: Appointment): string {
    return appointment.patient.phoneNumber || 'No phone';
  }

  getPatientDOB(appointment: Appointment): Date | null {
    return appointment.patient.dob ? new Date(appointment.patient.dob) : null;
  }

  viewAppointments(): void {
    this.router.navigate(['/doctor/appointments']);
  }

  manageSlots(): void {
    this.router.navigate(['/doctor/slots']);
  }

  viewMedicalNotes(appointment: Appointment): void {
    this.router.navigate(['/doctor/medical-notes', appointment.id]);
  }

  startChat(appointment: Appointment): void {
    this.router.navigate(['/doctor/chat', appointment.id]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}