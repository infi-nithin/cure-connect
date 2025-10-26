import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { AppointmentSlot } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-appointment-booking',
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.scss']
})
export class AppointmentBookingComponent implements OnInit {
  step = 1;
  doctors: User[] = [];
  availableSlots: AppointmentSlot[] = [];
  selectedDoctor: User | null = null;
  selectedSlot: AppointmentSlot | null = null;
  searchForm!: FormGroup;
  bookingForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      specialization: [''],
      doctorName: ['']
    });

    this.bookingForm = this.formBuilder.group({
      reason: ['', Validators.required]
    });

    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.apiService.get<User[]>('/doctors').subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load doctors';
        this.loading = false;
      }
    });
  }

  selectDoctor(doctor: User): void {
    this.selectedDoctor = doctor;
    this.step = 2;
    this.loadAvailableSlots(doctor.id);
  }

  loadAvailableSlots(doctorId: number): void {
    this.loading = true;
    this.apiService.get<AppointmentSlot[]>(`/doctors/${doctorId}/slots/available`).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load available slots';
        this.loading = false;
      }
    });
  }

  selectSlot(slot: AppointmentSlot): void {
    this.selectedSlot = slot;
    this.step = 3;
  }

  confirmBooking(): void {
    if (this.bookingForm.invalid || !this.selectedDoctor || !this.selectedSlot) {
      return;
    }

    this.loading = true;
    const bookingData = {
      doctorId: this.selectedDoctor.id,
      slotId: this.selectedSlot.id,
      reason: this.bookingForm.value.reason
    };

    this.apiService.post<any>('/appointments/book', bookingData).subscribe({
      next: () => {
        alert('Appointment booked successfully!');
        this.router.navigate(['/patient/appointments']);
      },
      error: (error) => {
        this.error = 'Failed to book appointment';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    if (this.step > 1) {
      this.step--;
      if (this.step === 1) {
        this.selectedDoctor = null;
        this.availableSlots = [];
      } else if (this.step === 2) {
        this.selectedSlot = null;
      }
    } else {
      this.router.navigate(['/patient/dashboard']);
    }
  }
}
