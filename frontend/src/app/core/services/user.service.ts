
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/v1/users`;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/${id}`);
  }

  getUserByEmail(email: string): Observable<UserDto> {
    const params = new HttpParams().set('email', email);
    return this.http.get<UserDto>(`${this.apiUrl}/email`, { params });
  }

  createUser(email: string, password: string, defaultRole: string): Observable<UserDto> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password)
      .set('defaultRole', defaultRole);
    return this.http.post<UserDto>(this.apiUrl, null, { params });
  }

  updateUser(id: string, enabled?: boolean, email?: string): Observable<UserDto> {
    const body: { enabled?: boolean, email?: string } = {};
    if (enabled !== undefined) {
      body.enabled = enabled;
    }
    if (email) {
      body.email = email;
    }
    return this.http.put<UserDto>(`${this.apiUrl}/${id}`, body);
  }

  updatePassword(id: string, newPassword: string): Observable<UserDto> {
    const body = { newPassword };
    return this.http.put<UserDto>(`${this.apiUrl}/${id}/password`, body);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addRoleToUser(userId: string, roleName: string): Observable<UserDto> {
    const params = new HttpParams().set('roleName', roleName);
    return this.http.post<UserDto>(`${this.apiUrl}/${userId}/roles`, null, { params });
  }

  removeRoleFromUser(userId: string, roleName: string): Observable<UserDto> {
    const params = new HttpParams().set('roleName', roleName);
    return this.http.delete<UserDto>(`${this.apiUrl}/${userId}/roles`, { params });
  }
}
