import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor.service';
import { SlotService } from '../../../core/services/slot.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';
import { Doctor } from '../../../core/models/doctor.model';
import { Slot } from '../../../core/models/slot.model';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-appointment-booking',
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.scss']
})
export class AppointmentBookingComponent implements OnInit {
  step = 1;
  doctors: Doctor[] = [];
  availableSlots: Slot[] = [];
  selectedDoctor: Doctor | null = null;
  selectedSlot: Slot | null = null;
  currentPatient: Patient | null = null;
  searchForm!: FormGroup;
  bookingForm!: FormGroup;
  loading = false;
  error = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private doctorService: DoctorService,
    private slotService: SlotService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      specialty: [''],
      doctorName: ['']
    });

    this.bookingForm = this.formBuilder.group({
      reason: ['', Validators.required]
    });

    this.loadCurrentPatient();
  }

  loadCurrentPatient(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Please log in to book an appointment';
      return;
    }

    this.patientService.getPatientByUserId(currentUser.id).subscribe({
      next: (patient) => {
        this.currentPatient = patient;
        this.loadDoctors();
      },
      error: (error) => {
        console.error('Error loading patient profile:', error);
        this.error = 'Failed to load patient profile';
      }
    });
  }

  loadDoctors(): void {
    this.loading = true;
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.error = 'Failed to load doctors';
        this.loading = false;
      }
    });
  }

  selectDoctor(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.step = 2;
    this.loadAvailableSlots(doctor.id);
  }

  loadAvailableSlots(doctorId: string): void {
    this.loading = true;
    this.slotService.getSlotsByDoctor(doctorId, true).subscribe({ // true for availableOnly
      next: (slots) => {
        this.availableSlots = slots.filter(slot => !slot.isBooked);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading available slots:', error);
        this.error = 'Failed to load available slots';
        this.loading = false;
      }
    });
  }

  selectSlot(slot: Slot): void {
    this.selectedSlot = slot;
    this.step = 3;
  }

  confirmBooking(): void {
    if (this.bookingForm.invalid || !this.selectedDoctor || !this.selectedSlot || !this.currentPatient) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.appointmentService.createAppointment(
      this.currentPatient.id,
      this.selectedSlot.id
    ).subscribe({
      next: (appointment) => {
        this.successMessage = 'Appointment booked successfully!';
        setTimeout(() => {
          this.router.navigate(['/patient/appointments']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error booking appointment:', error);
        this.error = 'Failed to book appointment. Please try again.';
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

  // Helper methods for template
  getDoctorDisplayName(doctor: Doctor): string {
    if (doctor.user.firstName && doctor.user.lastName) {
      return `${doctor.user.firstName} ${doctor.user.lastName}`;
    }
    return doctor.user.email.split('@')[0]; // Fallback to email username
  }

  getSlotDate(slot: Slot): Date {
    return new Date(slot.startTime);
  }

  getSlotEndTime(slot: Slot): Date {
    return new Date(slot.endTime);
  }

  formatTimeRange(slot: Slot): string {
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);
    return `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Safe getter methods for template
  getSelectedDoctorName(): string {
    return this.selectedDoctor ? this.getDoctorDisplayName(this.selectedDoctor) : '';
  }

  getSelectedDoctorSpecialty(): string {
    return this.selectedDoctor?.specialty || '';
  }

  getSelectedSlotDate(): Date | null {
    return this.selectedSlot ? this.getSlotDate(this.selectedSlot) : null;
  }

  getSelectedSlotTime(): string {
    return this.selectedSlot ? this.formatTimeRange(this.selectedSlot) : '';
  }

  getPatientEmail(): string {
    return this.currentPatient?.user.email || '';
  }
}