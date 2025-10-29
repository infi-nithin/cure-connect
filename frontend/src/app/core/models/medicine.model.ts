
import { Doctor } from './doctor.model';

export interface Medicine {
  id: string; 
  name: string;
  dosageForm?: string;
  description?: string;
  updatedBy?: Doctor;
}
