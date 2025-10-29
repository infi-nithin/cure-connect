import { Component, OnInit } from "@angular/core";
import { AppointmentService } from "../../../core/services/appointment.service";
import {
  Appointment,
  AppointmentStatus,
} from "../../../core/models/appointment.model";
import { AuthService } from "../../../core/services/auth.service";
import { PatientService } from "../../../core/services/patient.service";
import { Patient } from "../../../core/models/patient.model";

type AppointmentFilter = "ALL" | AppointmentStatus;

@Component({
  selector: "app-appointment-list",
  templateUrl: "./appointment-list.component.html",
  styleUrls: ["./appointment-list.component.scss"],
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  filter: AppointmentFilter = "ALL";
  loading = true;

  readonly AppointmentStatus = AppointmentStatus;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.loading = false;
      return;
    }

    this.patientService.getPatientByUserId(currentUser.id).subscribe({
      next: (patient) => {
        this.appointmentService.getAppointmentsByPatient(patient.id).subscribe({
          next: (appointments) => {
            this.appointments = appointments.sort(
              (a, b) =>
                new Date(b.slot.startTime).getTime() -
                new Date(a.slot.startTime).getTime()
            );
            this.applyFilter();
            this.loading = false;
          },
          error: (error) => {
            console.error("Error loading appointments:", error);
            this.loading = false;
          },
        });
      },
      error: (error) => {
        console.error("Error loading patient profile:", error);
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    if (this.filter === "ALL") {
      this.filteredAppointments = this.appointments;
    } else {
      this.filteredAppointments = this.appointments.filter(
        (a) => a.status === this.filter
      );
    }
  }

  setFilter(filter: AppointmentFilter): void {
    this.filter = filter;
    this.applyFilter();
  }

  getAppointmentDate(appointment: Appointment): Date {
    return new Date(appointment.slot.startTime);
  }

  getAppointmentTime(appointment: Appointment): string {
    const startTime = new Date(appointment.slot.startTime);
    const endTime = new Date(appointment.slot.endTime);
    return `${startTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  getDoctorName(appointment: Appointment): string {
    return appointment.slot.doctor.user.email.split("@")[0]; // Fallback to email username
  }

  getDoctorSpecialty(appointment: Appointment): string {
    return appointment.slot.doctor.specialty;
  }

  getStatusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.BOOKED:
        return "bg-primary";
      case AppointmentStatus.COMPLETED:
        return "bg-success";
      case AppointmentStatus.CANCELED:
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  }

  getFilterDisplayName(filter: AppointmentFilter): string {
    switch (filter) {
      case "ALL":
        return "all";
      case AppointmentStatus.BOOKED:
        return "upcoming";
      case AppointmentStatus.COMPLETED:
        return "completed";
      case AppointmentStatus.CANCELED:
        return "canceled";
      default:
        return filter;
    }
  }

  cancelAppointment(appointment: Appointment): void {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      this.appointmentService.cancelAppointment(appointment.id).subscribe({
        next: (updatedAppointment) => {
          // Update the appointment in the local array
          const index = this.appointments.findIndex(
            (a) => a.id === appointment.id
          );
          if (index !== -1) {
            this.appointments[index] = updatedAppointment;
            this.applyFilter();
          }
        },
        error: (error) => {
          console.error("Error canceling appointment:", error);
          alert("Failed to cancel appointment. Please try again.");
        },
      });
    }
  }

  canCancel(appointment: Appointment): boolean {
    const appointmentTime = new Date(appointment.slot.startTime);
    const now = new Date();
    const hoursDifference =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return (
      appointment.status === AppointmentStatus.BOOKED && hoursDifference > 24
    );
  }
}
