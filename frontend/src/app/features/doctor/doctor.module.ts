import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { TimeSlotManagerComponent } from './time-slot-manager/time-slot-manager.component';
import { MedicalNotesComponent } from './medical-notes/medical-notes.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  { path: 'dashboard', component: DoctorDashboardComponent },
  { path: 'appointments', component: AppointmentListComponent },
  { path: 'slots', component: TimeSlotManagerComponent },
  { path: 'notes/:appointmentId', component: MedicalNotesComponent },
  { path: 'chat/:appointmentId', component: ChatComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    DoctorDashboardComponent,
    AppointmentListComponent,
    TimeSlotManagerComponent,
    MedicalNotesComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class DoctorModule { }
