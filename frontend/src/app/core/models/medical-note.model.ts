
import { Appointment } from './appointment.model';
import { Doctor } from './doctor.model';

export interface MedicalNote {
  id: string; 
  appointment: Appointment;
  notesText?: string;
  updatedBy?: Doctor;
  createdAt: Date;
  updatedAt: Date;
}
