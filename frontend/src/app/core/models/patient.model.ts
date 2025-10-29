
import { User } from './user.model';

export interface Patient {
  id: string; 
  dob: Date;
  phoneNumber?: string;
  user: User;
}
