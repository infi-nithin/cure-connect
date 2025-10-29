
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicine } from '../models/medicine.model';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private apiUrl = `${environment.apiUrl}/v1/medicines`;

  constructor(private http: HttpClient) { }

  getMedicineById(id: string): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
  }

  getAllMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.apiUrl);
  }

  searchMedicinesByName(name: string): Observable<Medicine[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Medicine[]>(`${this.apiUrl}/search`, { params });
  }

  createMedicine(name: string, dosageForm: string, description: string, doctorId: string): Observable<Medicine> {
    const body = { name, dosageForm, description, doctorId };
    return this.http.post<Medicine>(this.apiUrl, body);
  }

  updateMedicine(id: string, name: string, dosageForm: string, description: string, doctorId: string): Observable<Medicine> {
    const body = { name, dosageForm, description, doctorId };
    return this.http.put<Medicine>(`${this.apiUrl}/${id}`, body);
  }

  deleteMedicine(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
