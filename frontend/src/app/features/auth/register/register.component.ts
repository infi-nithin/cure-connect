import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phoneNumber: [''],
      userType: ['PATIENT', Validators.required],
      // Doctor-specific fields
      licenseId: [''],
      specialty: ['']
    }, {
      validators: this.passwordMatchValidator
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Update validators based on user type
    this.registerForm.get('userType')?.valueChanges.subscribe(userType => {
      if (userType === 'DOCTOR') {
        this.registerForm.get('licenseId')?.setValidators([Validators.required]);
        this.registerForm.get('specialty')?.setValidators([Validators.required]);
      } else {
        this.registerForm.get('licenseId')?.clearValidators();
        this.registerForm.get('specialty')?.clearValidators();
      }
      this.registerForm.get('licenseId')?.updateValueAndValidity();
      this.registerForm.get('specialty')?.updateValueAndValidity();
    });
  }

  // Custom validator for password matching
  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    const registerData: RegisterDto = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phoneNumber: this.registerForm.value.phoneNumber || undefined
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.redirectBasedOnRole();
      },
      error: (error) => {
        this.error = this.getErrorMessage(error);
        this.loading = false;
      }
    });
  }

  private redirectBasedOnRole(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/']);
      return;
    }

    // Check user roles and redirect accordingly
    if (this.authService.hasRole('ADMIN')) {
      this.router.navigateByUrl(this.returnUrl || '/admin/dashboard');
    } else if (this.authService.hasRole('DOCTOR')) {
      this.router.navigateByUrl(this.returnUrl || '/doctor/dashboard');
    } else if (this.authService.hasRole('PATIENT')) {
      this.router.navigateByUrl(this.returnUrl || '/patient/dashboard');
    } else {
      // Default fallback - redirect based on userType from form
      const userType = this.registerForm.get('userType')?.value;
      if (userType === 'DOCTOR') {
        this.router.navigate(['/doctor/dashboard']);
      } else {
        this.router.navigate(['/patient/dashboard']);
      }
    }
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.status === 0) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    
    if (error.status === 400) {
      return 'Invalid registration data. Please check your information.';
    }
    
    if (error.status === 409) {
      return 'An account with this email already exists. Please use a different email.';
    }
    
    return 'Registration failed. Please try again.';
  }

  // Helper method to check if field has error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(
      field && 
      field.errors && 
      field.errors[errorType] && 
      (field.touched || this.submitted)
    );
  }

  // Check if passwords match
  get passwordsMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword;
  }

  // Check if user type is doctor
  get isDoctor(): boolean {
    return this.registerForm.get('userType')?.value === 'DOCTOR';
  }
}