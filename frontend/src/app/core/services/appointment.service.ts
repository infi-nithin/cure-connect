
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/v1/appointments`;

  constructor(private http: HttpClient) { }

  createAppointment(patientId: string, slotId: string): Observable<Appointment> {
    const params = new HttpParams()
      .set('patientId', patientId)
      .set('slotId', slotId);
    return this.http.post<Appointment>(this.apiUrl, null, { params });
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  getAppointmentsByPatient(patientId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getAppointmentsByDoctor(doctorId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  searchAppointments(patientId: string, status?: AppointmentStatus): Observable<Appointment[]> {
    let params = new HttpParams().set('patientId', patientId);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Appointment[]>(`${this.apiUrl}/search`, { params: params });
  }

  cancelAppointment(id: string): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}/cancel`, null);
  }

  completeAppointment(id: string): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}/complete`, null);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
