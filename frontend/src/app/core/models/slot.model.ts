
import { Doctor } from './doctor.model';

export interface Slot {
  id: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  doctor: Doctor;
  createdAt: Date;
  updatedAt?: Date;
}
