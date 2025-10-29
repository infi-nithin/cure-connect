import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { LoginDto } from "../../../core/models/user.model";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = "";
  // 1. Store the returnUrl. Let it be null if not present.
  private returnUrl: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    }); // 2. Get the returnUrl. DO NOT provide a fallback to '/'.

    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || null;

    // 3. If already logged in, redirect away from the login page
    if (this.authService.isAuthenticated()) {
      // Use the same logic as a successful login
      this.handleSuccessfulLogin();
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = "";

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const loginData: LoginDto = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.handleSuccessfulLogin();
        this.loading = false;
      },
      error: (error) => {
        this.error = this.getErrorMessage(error);
        this.loading = false;
      },
    });
  }

  private handleSuccessfulLogin(): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      const defaultDashboard = this.getDefaultDashboardByRole();
      this.router.navigate([defaultDashboard]);
    }
  }

  private getDefaultDashboardByRole(): string {
    if (this.authService.hasRole("ADMIN")) {
      return "/admin/dashboard";
    }

    if (this.authService.hasRole("DOCTOR")) {
      return "/doctor/dashboard";
    }

    if (this.authService.hasRole("PATIENT")) {
      return "/patient/dashboard"; 
    }

    return "/";
  }

  private getErrorMessage(error: any): string {
    // (Your error handling logic is good, no changes needed here)
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.status === 0) {
      return "Unable to connect to server. Please check your internet connection.";
    }
    if (error.status === 401) {
      return "Invalid email or password. Please try again.";
    }
    if (error.status === 403) {
      return "Your account is disabled. Please contact support.";
    }
    return "Login failed. Please check your credentials and try again.";
  }
}
