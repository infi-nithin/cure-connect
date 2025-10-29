import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { AdminStats } from "../../../core/models/adminStats.model";
import { DetailedAdminStats } from "../../../core/models/detailedAdminStats.model";
import { User } from "../../../core/models/user.model";
import { AdminService } from "../../../core/services/admin.service";

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats = {
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
  };
  detailedStats: DetailedAdminStats | null = null;
  loading = true;
  currentUser: User | null;
  currentTime = new Date();

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardStats();

    // Update time every minute
    setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  }

  loadDashboardStats(): void {
    this.loading = true;

    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading stats:", error);
        this.loading = false;
      },
    });
  }

  loadDetailedStats(): void {
    this.adminService.getDetailedStats().subscribe({
      next: (detailedStats) => {
        this.detailedStats = detailedStats;
        // You can display this in a modal or separate page
        console.log('Detailed Stats:', detailedStats);
      },
      error: (error) => {
        console.error("Error loading detailed stats:", error);
      },
    });
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return "";
    }
    return `${user.firstName} ${user.lastName}`.trim();
  }

  goToUserManagement(): void {
    this.router.navigate(['/admin', 'users']);
  }

  goToDoctorManagement(): void {
    this.router.navigate(['/admin', 'doctors']);
  }

  goToStatistics(): void {
    this.router.navigate(['/admin', 'stats']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/auth/login"]);
  }
}