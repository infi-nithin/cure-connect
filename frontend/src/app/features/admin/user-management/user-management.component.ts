import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { UserService } from '../../../core/services/user.service';
import { Patient } from '../../../core/models/patient.model';
import { UserDto } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  patients: Patient[] = [];
  patientForm!: FormGroup;
  showModal = false;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder, 
    private patientService: PatientService,
    private userService: UserService,
        private authService: AuthService,
        private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadPatients();
  }

  initForm(): void {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      dob: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getAllPatients().subscribe({
      next: (patients) => { 
        this.patients = patients;
        this.loading = false;
      },
      error: (error) => { 
        console.error('Error loading patients:', error);
        this.error = 'Failed to load patients';
        this.loading = false;
      }
    });
  }

  createPatient(): void {
    if (this.patientForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.patientForm.value;
    this.loading = true;

    // Create patient using the patient service
    this.patientService.createPatientProfile(
      formValue.email,
      formValue.password,
      formValue.dob,
      formValue.phoneNumber
    ).subscribe({
      next: (patient) => { 
        this.loadPatients(); 
        this.showModal = false;
        this.patientForm.reset();
        this.loading = false;
      },
      error: (error) => { 
        console.error('Error creating patient:', error);
        this.error = error.error?.message || 'Failed to create patient';
        this.loading = false;
      }
    });
  }

  togglePatientStatus(patient: Patient): void {
    const newStatus = !patient.user.enabled;
    this.userService.updateUser(patient.user.id, newStatus).subscribe({
      next: () => {
        patient.user.enabled = newStatus;
      },
      error: (error) => {
        console.error('Error updating patient status:', error);
        this.error = 'Failed to update patient status';
      }
    });
  }

  resetPassword(user: UserDto): void {
    const newPassword = prompt(`Enter new password for ${user.firstName} ${user.lastName}:`);
    if (newPassword && newPassword.length >= 6) {
      this.userService.updatePassword(user.id, newPassword).subscribe({
        next: () => {
          alert('Password updated successfully');
        },
        error: (error) => {
          console.error('Error updating password:', error);
          this.error = 'Failed to update password';
        }
      });
    } else if (newPassword) {
      alert('Password must be at least 6 characters long');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.patientForm.controls).forEach(key => {
      this.patientForm.get(key)?.markAsTouched();
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.patientForm.reset();
    this.error = '';
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return "Admin User";
    }
    return `${user.firstName} ${user.lastName}`.trim();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}