import { Role } from "./role.model";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  createdAt: Date;
  roles: Role[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  createdAt: Date;
  roles: Role[];
}
