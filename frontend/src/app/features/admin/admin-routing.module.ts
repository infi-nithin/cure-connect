import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DoctorManagementComponent } from './doctor-management/doctor-management.component';
import { DetailedStatsComponent } from './detailed-stats/detailed-stats.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    data: { title: 'Admin Dashboard' }
  },
  {
    path: 'users',
    component: UserManagementComponent,
    data: { title: 'User Management' }
  },
  {
    path: 'doctors',
    component: DoctorManagementComponent,
    data: { title: 'Doctor Management' }
  },
  {
    path: 'stats',
    component: DetailedStatsComponent,
    data: { title: 'Detailed Analytics' }
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }