import { inject, NgModule } from '@angular/core';
import { CanActivateFn, RouterModule, Router, Routes } from '@angular/router';
import { AuthService } from './core/services/auth.service';

const canActivateWithRole: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (expectedRole && !authService.hasRole(expectedRole)) {
    console.log("PATIENT");
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};

const routes: Routes = [
  {
    path:"",
    redirectTo:"/auth/login",
    pathMatch:"full"
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'patient',
    loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule),
    canActivate: [canActivateWithRole],
    data: { role: 'PATIENT' }
  },
  {
    path: 'doctor',
    loadChildren: () => import('./features/doctor/doctor.module').then(m => m.DoctorModule),
    canActivate: [canActivateWithRole],
    data: { role: 'DOCTOR' }
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [canActivateWithRole],
    data: { role: 'ADMIN' }
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }