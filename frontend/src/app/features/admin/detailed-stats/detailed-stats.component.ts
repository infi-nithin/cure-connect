import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { DetailedAdminStats } from "../../../core/models/detailedAdminStats.model";
import { User } from "../../../core/models/user.model";
import { AdminService } from "../../../core/services/admin.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-detailed-stats",
  templateUrl: "./detailed-stats.component.html",
  standalone: true,
  imports: [CommonModule],
  styleUrls: ["./detailed-stats.component.scss"],
})
export class DetailedStatsComponent implements OnInit {
  detailedStats: DetailedAdminStats | null = null;
  loading = true;
  currentUser: User | null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDetailedStats();
  }

  loadDetailedStats(): void {
    this.loading = true;

    this.adminService.getDetailedStats().subscribe({
      next: (stats) => {
        this.detailedStats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading detailed stats:", error);
        this.loading = false;
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

  goBack(): void {
    this.router.navigate(["/admin/dashboard"]);
  }

  refreshStats(): void {
    this.loadDetailedStats();
  }

  getAppointmentPercentage(status: string): number {
    if (!this.detailedStats || this.detailedStats.totalAppointments === 0) {
      return 0;
    }

    switch (status) {
      case 'booked':
        return (this.detailedStats.bookedAppointments / this.detailedStats.totalAppointments) * 100;
      case 'completed':
        return (this.detailedStats.completedAppointments / this.detailedStats.totalAppointments) * 100;
      case 'cancelled':
        return (this.detailedStats.cancelledAppointments / this.detailedStats.totalAppointments) * 100;
      default:
        return 0;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/auth/login"]);
  }
}