import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Prescription } from '../../../core/models/prescription.model';

@Component({
  selector: 'app-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.scss']
})
export class PrescriptionListComponent implements OnInit {
  prescriptions: Prescription[] = [];
  loading = true;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.get<Prescription[]>('/prescriptions').subscribe({
      next: (data) => {
        this.prescriptions = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
