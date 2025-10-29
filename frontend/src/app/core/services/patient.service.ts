import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Patient } from "../models/patient.model";

@Injectable({
  providedIn: "root",
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/v1/patients`;

  constructor(private http: HttpClient) {}

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  getPatientByUserId(userId: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/user/${userId}`);
  }

  createPatientProfile(
    email: string,
    password: string,
    dob: string | Date,
    phoneNumber?: string
  ): Observable<Patient> {
    // Ensure date is in YYYY-MM-DD format
    const formattedDob = this.ensureIsoDateFormat(dob);

    let params = new HttpParams()
      .set("email", email)
      .set("password", password)
      .set("dob", formattedDob);

    if (phoneNumber) {
      params = params.set("phoneNumber", phoneNumber);
    }

    return this.http.post<Patient>(`${this.apiUrl}/register`, null, { params });
  }

  private ensureIsoDateFormat(date: string | Date): string {
    if (!date) {
      throw new Error("Date of birth is required");
    }

    if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date provided");
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  updatePatientProfile(
    id: string,
    dob?: string,
    phoneNumber?: string
  ): Observable<Patient> {
    const body: { dob?: string; phoneNumber?: string } = {};
    if (dob) {
      body.dob = dob;
    }
    if (phoneNumber) {
      body.phoneNumber = phoneNumber;
    }
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, body);
  }

  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
