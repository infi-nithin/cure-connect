import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminStats } from '../models/adminStats.model';
import { DetailedAdminStats } from '../models/detailedAdminStats.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/v1/admin`;

  constructor(private http: HttpClient) { }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  getDetailedStats(): Observable<DetailedAdminStats> {
    return this.http.get<DetailedAdminStats>(`${this.apiUrl}/stats/detailed`);
  }
}