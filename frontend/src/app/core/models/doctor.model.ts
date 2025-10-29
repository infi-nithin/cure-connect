
import { User } from './user.model';

export interface Doctor {
  id: string; 
  specialty: string;
  licenseId: string;
  user: User;
}
