import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  userForm!: FormGroup;
  showModal = false;

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      role: ['PATIENT']
    });
    this.loadUsers();
  }

  loadUsers(): void {
    this.apiService.get<any[]>('/admin/users').subscribe({
      next: (data) => { this.users = data; },
      error: () => { }
    });
  }

  createUser(): void {
    this.apiService.post('/admin/users', this.userForm.value).subscribe({
      next: () => { this.loadUsers(); this.showModal = false; },
      error: () => { }
    });
  }
}
