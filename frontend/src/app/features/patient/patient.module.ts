import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { AppointmentBookingComponent } from './appointment-booking/appointment-booking.component';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { PrescriptionListComponent } from './prescription-list/prescription-list.component';
import { ChatComponent } from './chat/chat.component';
import { PatientRoutingModule } from './patient-routing.module';


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
    PatientRoutingModule
  ]
})
export class PatientModule { }
