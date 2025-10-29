import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DoctorService } from "../../../core/services/doctor.service";
import { UserService } from "../../../core/services/user.service";
import { Doctor } from "../../../core/models/doctor.model";
import { UserDto } from "../../../core/models/user.model";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-doctor-management",
  templateUrl: "./doctor-management.component.html",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ["./doctor-management.component.scss"],
})
export class DoctorManagementComponent implements OnInit {
  doctors: Doctor[] = [];
  doctorForm!: FormGroup;
  showModal = false;
  loading = false;
  error = "";

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDoctors();
  }

  initForm(): void {
    this.doctorForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      licenseId: ["", [Validators.required]],
      specialty: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
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
        console.error("Error loading doctors:", error);
        this.error = "Failed to load doctors";
        this.loading = false;
      },
    });
  }

  createDoctor(): void {
    if (this.doctorForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.doctorForm.value;
    this.loading = true;

    this.doctorService
      .createDoctorProfile(
        formValue.email,
        formValue.password,
        formValue.licenseId,
        formValue.specialty
      )
      .subscribe({
        next: (doctor) => {
          this.loadDoctors();
          this.showModal = false;
          this.doctorForm.reset();
          this.loading = false;
        },
        error: (error) => {
          console.error("Error creating doctor:", error);
          this.error = error.error?.message || "Failed to create doctor";
          this.loading = false;
        },
      });
  }

  toggleDoctorStatus(doctor: Doctor): void {
    const newStatus = !doctor.user.enabled;
    this.userService.updateUser(doctor.user.id, newStatus).subscribe({
      next: () => {
        doctor.user.enabled = newStatus;
      },
      error: (error) => {
        console.error("Error updating doctor status:", error);
        this.error = "Failed to update doctor status";
      },
    });
  }

  resetPassword(user: UserDto): void {
    const newPassword = prompt(
      `Enter new password for Dr. ${user.firstName} ${user.lastName}:`
    );
    if (newPassword && newPassword.length >= 6) {
      this.userService.updatePassword(user.id, newPassword).subscribe({
        next: () => {
          alert("Password updated successfully");
        },
        error: (error) => {
          console.error("Error updating password:", error);
          this.error = "Failed to update password";
        },
      });
    } else if (newPassword) {
      alert("Password must be at least 6 characters long");
    }
  }

  updateDoctorSpecialty(doctor: Doctor): void {
    const newSpecialty = prompt(
      `Enter new specialty for Dr. ${doctor.user.firstName} ${doctor.user.lastName}:`,
      doctor.specialty
    );
    if (newSpecialty && newSpecialty.trim()) {
      this.doctorService
        .updateDoctorProfile(doctor.id, newSpecialty.trim())
        .subscribe({
          next: (updatedDoctor) => {
            doctor.specialty = updatedDoctor.specialty;
          },
          error: (error) => {
            console.error("Error updating doctor specialty:", error);
            this.error = "Failed to update doctor specialty";
          },
        });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.doctorForm.controls).forEach((key) => {
      this.doctorForm.get(key)?.markAsTouched();
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.doctorForm.reset();
    this.error = "";
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
