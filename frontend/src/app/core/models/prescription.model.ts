export interface Prescription {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  medication: string;
  dosage: string;
  duration: string;
  instructions?: string;
  notes?: string;
  prescribedDate: Date;
  createdAt?: Date;
}
