import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  todayAppointments: Appointment[] = [];
  pendingAppointments: Appointment[] = [];
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
    
    this.apiService.get<Appointment[]>('/doctor/appointments/today').subscribe({
      next: (appointments) => {
        this.todayAppointments = appointments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading today appointments:', error);
        this.loading = false;
      }
    });

    this.apiService.get<Appointment[]>('/doctor/appointments/pending').subscribe({
      next: (appointments) => {
        this.pendingAppointments = appointments;
      },
      error: (error) => {
        console.error('Error loading pending appointments:', error);
      }
    });
  }

  viewAppointments(): void {
    this.router.navigate(['/doctor/appointments']);
  }

  manageSlots(): void {
    this.router.navigate(['/doctor/slots']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
