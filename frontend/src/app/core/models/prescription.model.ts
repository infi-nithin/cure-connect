import { Patient } from './patient.model';
import { Doctor } from './doctor.model';
import { PrescriptionMedicine } from './prescription-medicine.model';

export interface Prescription {
  id: string; 
  patient: Patient;
  doctor: Doctor;
  dosage?: string;
  instructions?: string;
  createdAt: Date;
  medicines: PrescriptionMedicine[];
}