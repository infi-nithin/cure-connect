import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { AppointmentBookingComponent } from './appointment-booking/appointment-booking.component';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { PrescriptionListComponent } from './prescription-list/prescription-list.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  { path: 'dashboard', component: PatientDashboardComponent },
  { path: 'book-appointment', component: AppointmentBookingComponent },
  { path: 'appointments', component: AppointmentListComponent },
  { path: 'prescriptions', component: PrescriptionListComponent },
  { path: 'chat/:appointmentId', component: ChatComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    PatientDashboardComponent,
    AppointmentBookingComponent,
    AppointmentListComponent,
    PrescriptionListComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class PatientModule { }
