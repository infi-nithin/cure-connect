
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/v1/doctors`;

  constructor(private http: HttpClient) { }

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiUrl);
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
  }

  getDoctorByUserId(userId: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/user/${userId}`);
  }

  createDoctorProfile(email: string, password: string, licenseId: string, specialty: string): Observable<Doctor> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password)
      .set('licenseId', licenseId)
      .set('specialty', specialty);
    return this.http.post<Doctor>(this.apiUrl, null, { params });
  }

  updateDoctorProfile(id: string, specialty: string): Observable<Doctor> {
    const params = new HttpParams().set('specialty', specialty);
    return this.http.put<Doctor>(`${this.apiUrl}/${id}`, null, { params });
  }

  deleteDoctor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
