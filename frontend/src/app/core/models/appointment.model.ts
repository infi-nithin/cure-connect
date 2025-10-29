import { Slot } from './slot.model';
import { Patient } from './patient.model';

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

export interface Appointment {
  id: string; 
  slot: Slot;
  patient: Patient;
  status: AppointmentStatus;
}