
import { Medicine } from './medicine.model';

export interface PrescriptionMedicineId {
  prescriptionId: string; 
  medicineId: string; 
}

export interface PrescriptionMedicine {
  id: PrescriptionMedicineId;
  medicine: Medicine;
  quantity: number;
}
