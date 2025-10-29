
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicalNote } from '../models/medical-note.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalNoteService {
  private apiUrl = `${environment.apiUrl}/v1/medical-notes`;

  constructor(private http: HttpClient) { }

  getNoteByAppointmentId(appointmentId: string): Observable<MedicalNote> {
    return this.http.get<MedicalNote>(`${this.apiUrl}/appointment/${appointmentId}`);
  }

  createNote(appointmentId: string, notesText: string, doctorId: string): Observable<MedicalNote> {
    const body = { notesText, doctorId };
    return this.http.post<MedicalNote>(`${this.apiUrl}/${appointmentId}`, body);
  }

  updateNote(noteId: string, notesText: string, doctorId: string): Observable<MedicalNote> {
    const body = { notesText, doctorId };
    return this.http.put<MedicalNote>(`${this.apiUrl}/${noteId}`, body);
  }

  deleteNote(noteId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${noteId}`);
  }
}
