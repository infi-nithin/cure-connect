import { Component, OnInit } from '@angular/core';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { Prescription } from '../../../core/models/prescription.model';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.scss']
})
export class PrescriptionListComponent implements OnInit {
  prescriptions: Prescription[] = [];
  loading = true;
  currentPatient: Patient | null = null;

  constructor(
    private prescriptionService: PrescriptionService,
    private authService: AuthService,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.loading = false;
      return;
    }

    this.patientService.getPatientByUserId(currentUser.id).subscribe({
      next: (patient) => {
        this.currentPatient = patient;
        this.prescriptionService.getPrescriptionsByPatient(patient.id).subscribe({
          next: (prescriptions) => {
            this.prescriptions = prescriptions.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading prescriptions:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading patient profile:', error);
        this.loading = false;
      }
    });
  }

  getMedicationNames(prescription: Prescription): string {
    return prescription.medicines
      .map(pm => pm.medicine.name)
      .join(', ');
  }

  getDoctorName(prescription: Prescription): string {
    return prescription.doctor.user.email.split('@')[0];
  }

  getMedicineDetails(prescription: Prescription): string {
    return prescription.medicines
      .map(pm => `${pm.medicine.name}${pm.medicine.dosageForm ? ` (${pm.medicine.dosageForm})` : ''} - ${pm.quantity}x`)
      .join('; ');
  }
}