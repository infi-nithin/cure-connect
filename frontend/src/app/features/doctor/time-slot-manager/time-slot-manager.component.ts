import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-time-slot-manager',
  templateUrl: './time-slot-manager.component.html',
  styleUrls: ['./time-slot-manager.component.scss']
})
export class TimeSlotManagerComponent implements OnInit {
  slotForm!: FormGroup;
  slots: any[] = [];
  weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    this.slotForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      recurring: [false],
      dayOfWeek: ['']
    });
    this.loadSlots();
  }

  loadSlots(): void {
    this.apiService.get<any[]>('/doctor/slots').subscribe({
      next: (data) => { this.slots = data; },
      error: () => { }
    });
  }

  addSlot(): void {
    if (this.slotForm.valid) {
      this.apiService.post('/doctor/slots', this.slotForm.value).subscribe({
        next: () => { this.loadSlots(); this.slotForm.reset(); },
        error: () => { }
      });
    }
  }

  deleteSlot(slotId: number): void {
    if (confirm('Delete this slot?')) {
      this.apiService.delete(`/doctor/slots/${slotId}`).subscribe({
        next: () => { this.loadSlots(); },
        error: () => { }
      });
    }
  }
}
