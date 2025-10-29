import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { User, LoginDto, RegisterDto } from "../models/user.model";
import { environment } from "../../../environments/environment";
import { jwtDecode } from "jwt-decode";

interface AuthResponse {
  token: string;
  message: string;
}

interface DecodedToken {
  sub: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/v1/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getStoredToken();
    if (token && this.isAuthenticated()) {
      const user = this.getCurrentUser();
      this.currentUserSubject.next(user);
    }
  }

  getStoredToken(): string | null {
    return localStorage.getItem("token");
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          const user = this.getCurrentUser();
          this.currentUserSubject.next(user);
        })
      );
  }

  register(userData: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          const user = this.getCurrentUser();
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    this.removeToken();
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  hasRole(role: string): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.roles.includes(role);
    } catch (error) {
      console.error('Error checking role from token:', error);
      return false;
    }
  }

  getCurrentUser(): User | null {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return this.createUserFromToken(decodedToken);
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }

  private storeToken(token: string): void {
    localStorage.setItem("token", token);
  }

  private removeToken(): void {
    localStorage.removeItem("token");
  }

  private createUserFromToken(decodedToken: DecodedToken): User {
    const roles = decodedToken.roles.map((roleName, index) => ({
      id: index.toString(),
      name: roleName
    }));

    return {
      id: decodedToken.sub,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName,
      email: decodedToken.email,
      roles: roles,
      enabled: true,
      createdAt: new Date(decodedToken.iat * 1000),
    };
  }
}