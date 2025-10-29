import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Appointment } from '../../../core/models/appointment.model';
import { User } from '../../../core/models/user.model';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;
  currentUser: User | null;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private doctorService: DoctorService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    if (this.currentUser) {
      this.doctorService.getDoctorByUserId(this.currentUser.id).pipe(
        switchMap(doctor => this.appointmentService.getAppointmentsByDoctor(doctor.id))
      ).subscribe({
        next: (data) => {
          this.appointments = data;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    }
  }
}