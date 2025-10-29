
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Slot } from '../models/slot.model';

@Injectable({
  providedIn: 'root'
})
export class SlotService {
  private apiUrl = `${environment.apiUrl}/v1/slots`;

  constructor(private http: HttpClient) { }

  getSlotById(id: string): Observable<Slot> {
    return this.http.get<Slot>(`${this.apiUrl}/${id}`);
  }

  getSlotsByDoctor(doctorId: string, availableOnly: boolean = false): Observable<Slot[]> {
    const params = new HttpParams().set('availableOnly', availableOnly.toString());
    return this.http.get<Slot[]>(`${this.apiUrl}/doctor/${doctorId}`, { params });
  }

  createSlot(doctorId: string, startTime: string, endTime: string): Observable<Slot> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('startTime', startTime)
      .set('endTime', endTime);
    return this.http.post<Slot>(this.apiUrl, null, { params });
  }

  updateSlotTime(slotId: string, startTime: string, endTime: string): Observable<Slot> {
    const body = { startTime, endTime };
    return this.http.put<Slot>(`${this.apiUrl}/${slotId}`, body);
  }

  deleteSlot(slotId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${slotId}`);
  }
}
