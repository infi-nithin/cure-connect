import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { Prescription } from '../../../core/models/prescription.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { User } from '../../../core/models/user.model';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit {
  nextAppointment: Appointment | null = null;
  recentPrescriptions: Prescription[] = [];
  upcomingAppointments: Appointment[] = [];
  loading = true;
  currentUser: User | null;
  currentPatient: Patient | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private prescriptionService: PrescriptionService,
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    if (!this.currentUser) {
      this.loading = false;
      return;
    }

    // Get patient profile first
    this.patientService.getPatientByUserId(this.currentUser.id).subscribe({
      next: (patient) => {
        this.currentPatient = patient;
        this.loadAppointments(patient.id);
        this.loadPrescriptions(patient.id);
      },
      error: (error) => {
        console.error('Error loading patient profile:', error);
        this.loading = false;
      }
    });
  }

  private loadAppointments(patientId: string): void {
    this.appointmentService.getAppointmentsByPatient(patientId).subscribe({
      next: (appointments) => {
        const now = new Date();
        this.upcomingAppointments = appointments
          .filter(a => 
            new Date(a.slot.startTime) > now && 
            a.status === AppointmentStatus.BOOKED
          )
          .sort((a, b) => 
            new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime()
          );
        
        this.nextAppointment = this.upcomingAppointments.length > 0 ? 
          this.upcomingAppointments[0] : null;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });
  }

  private loadPrescriptions(patientId: string): void {
    this.prescriptionService.getPrescriptionsByPatient(patientId).subscribe({
      next: (prescriptions) => {
        this.recentPrescriptions = prescriptions
          .sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading prescriptions:', error);
        this.loading = false;
      }
    });
  }

  getDoctorName(appointment: Appointment): string {
    return appointment.slot.doctor.user.email.split('@')[0];
  }

  getDoctorSpecialty(appointment: Appointment): string {
    return appointment.slot.doctor.specialty;
  }

  getAppointmentDateTime(appointment: Appointment): Date {
    return new Date(appointment.slot.startTime);
  }

  getMedicationNames(prescription: Prescription): string {
    return prescription.medicines
      .map(pm => pm.medicine.name)
      .join(', ');
  }

  getPrescriptionDoctorName(prescription: Prescription): string {
    return prescription.doctor.user.email.split('@')[0];
  }

  bookAppointment(): void {
    this.router.navigate(['/patient/book-appointment']);
  }

  viewAppointments(): void {
    this.router.navigate(['/patient/appointments']);
  }

  viewPrescriptions(): void {
    this.router.navigate(['/patient/prescriptions']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}