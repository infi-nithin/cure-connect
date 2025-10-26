import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Prescription } from '../../../core/models/prescription.model';

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
  currentUser: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.apiService.get<Appointment[]>('/appointments/upcoming').subscribe({
      next: (appointments) => {
        this.upcomingAppointments = appointments;
        this.nextAppointment = appointments.length > 0 ? appointments[0] : null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.loading = false;
      }
    });

    this.apiService.get<Prescription[]>('/prescriptions/recent').subscribe({
      next: (prescriptions) => {
        this.recentPrescriptions = prescriptions.slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading prescriptions:', error);
      }
    });
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
