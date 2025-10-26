export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string;
  dateTime: Date;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';
  reason?: string;
  notes?: string;
  createdAt?: Date;
}

export interface AppointmentSlot {
  id: number;
  doctorId: number;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  recurring?: boolean;
  dayOfWeek?: number;
}

export interface BookAppointmentRequest {
  doctorId: number;
  slotId: number;
  reason?: string;
}
