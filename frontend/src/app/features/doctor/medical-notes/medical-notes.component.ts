import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-medical-notes',
  templateUrl: './medical-notes.component.html',
  styleUrls: ['./medical-notes.component.scss']
})
export class MedicalNotesComponent implements OnInit {
  notesForm!: FormGroup;
  appointmentId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));
    this.notesForm = this.fb.group({ notes: [''] });
    this.loadNotes();
  }

  loadNotes(): void {
    this.apiService.get<any>(`/appointments/${this.appointmentId}/notes`).subscribe({
      next: (data) => { this.notesForm.patchValue({ notes: data.notes }); },
      error: () => { }
    });
  }

  saveNotes(): void {
    this.apiService.post(`/appointments/${this.appointmentId}/notes`, this.notesForm.value).subscribe({
      next: () => { alert('Notes saved successfully!'); },
      error: () => { }
    });
  }
}
