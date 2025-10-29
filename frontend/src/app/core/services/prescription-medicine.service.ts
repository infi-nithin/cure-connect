
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PrescriptionMedicine } from '../models/prescription-medicine.model';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionMedicineService {
  private apiUrl = `${environment.apiUrl}/v1/prescription-medicines`;

  constructor(private http: HttpClient) { }

  getMedicinesByPrescriptionId(prescriptionId: string): Observable<PrescriptionMedicine[]> {
    return this.http.get<PrescriptionMedicine[]>(`${this.apiUrl}/prescription/${prescriptionId}`);
  }

  getPrescriptionsByMedicineId(medicineId: string): Observable<PrescriptionMedicine[]> {
    return this.http.get<PrescriptionMedicine[]>(`${this.apiUrl}/medicine/${medicineId}`);
  }

  updateQuantity(prescriptionId: string, medicineId: string, quantity: number): Observable<PrescriptionMedicine> {
    const body = { quantity };
    return this.http.put<PrescriptionMedicine>(`${this.apiUrl}/${prescriptionId}/${medicineId}`, body);
  }

  deletePrescriptionMedicineLink(prescriptionId: string, medicineId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${prescriptionId}/${medicineId}`);
  }
}
