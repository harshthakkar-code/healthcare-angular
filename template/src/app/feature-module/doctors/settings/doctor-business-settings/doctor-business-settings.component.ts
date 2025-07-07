import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-doctor-business-settings',
    templateUrl: './doctor-business-settings.component.html',
    styleUrl: './doctor-business-settings.component.scss',
    standalone: false
})
export class DoctorBusinessSettingsComponent {
  public routes  = routes
  showTimePicker: Array<string> = []
  time: Date = new Date();
  selectedDays: string[] = [];
  date = new Date();
  startTime1 = new Date();
  startTime2 = new Date();
  startTime3 = new Date();
  startTime4 = new Date();
  startTime5 = new Date();
  startTime6 = new Date();
  startTime7 = new Date();
  endTime1 = new Date();
  endTime2 = new Date();
  endTime3 = new Date();
  endTime4 = new Date();
  endTime5 = new Date();
  endTime6 = new Date();
  endTime7 = new Date();
  myDateValue!: Date ;
  doctorId: string | null = null;
  loading = false;
  error: string | null = null;
  invalidDays: string[] = [];

  constructor( private datePipe: DatePipe) { 
    this.selectDay('Monday');
    this.selectDay('Friday');
    this.selectDay('Tuesday');
    this.selectDay('Wednesday');
    this.selectDay('Thursday');
    this.doctorId = this.getDoctorIdFromLocalStorage();
    if (this.doctorId) {
      this.fetchBusinessSettings();
    }
  }

  getDoctorIdFromLocalStorage(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  fetchBusinessSettings() {
    if (!this.doctorId) return;
    this.loading = true;
    api.get(`/doctor-settings/${this.doctorId}`)
      .then(res => {
        const businessSettings = res.data.businessSettings && res.data.businessSettings[0] ? res.data.businessSettings[0] : {};
        // Map backend data to UI fields
        if (businessSettings.selectedDays) this.selectedDays = businessSettings.selectedDays;
        if (businessSettings.startTime1) this.startTime1 = new Date(businessSettings.startTime1);
        if (businessSettings.endTime1) this.endTime1 = new Date(businessSettings.endTime1);
        if (businessSettings.startTime2) this.startTime2 = new Date(businessSettings.startTime2);
        if (businessSettings.endTime2) this.endTime2 = new Date(businessSettings.endTime2);
        if (businessSettings.startTime3) this.startTime3 = new Date(businessSettings.startTime3);
        if (businessSettings.endTime3) this.endTime3 = new Date(businessSettings.endTime3);
        if (businessSettings.startTime4) this.startTime4 = new Date(businessSettings.startTime4);
        if (businessSettings.endTime4) this.endTime4 = new Date(businessSettings.endTime4);
        if (businessSettings.startTime5) this.startTime5 = new Date(businessSettings.startTime5);
        if (businessSettings.endTime5) this.endTime5 = new Date(businessSettings.endTime5);
        if (businessSettings.startTime6) this.startTime6 = new Date(businessSettings.startTime6);
        if (businessSettings.endTime6) this.endTime6 = new Date(businessSettings.endTime6);
        if (businessSettings.startTime7) this.startTime7 = new Date(businessSettings.startTime7);
        if (businessSettings.endTime7) this.endTime7 = new Date(businessSettings.endTime7);
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        this.error = 'Failed to load business settings.';
      });
  }

  isValidBusinessHours(): boolean {
    this.invalidDays = [];
    for (const day of this.selectedDays) {
      let start: Date, end: Date;
      switch (day) {
        case 'Monday': start = this.startTime1; end = this.endTime1; break;
        case 'Tuesday': start = this.startTime2; end = this.endTime2; break;
        case 'Wednesday': start = this.startTime3; end = this.endTime3; break;
        case 'Thursday': start = this.startTime4; end = this.endTime4; break;
        case 'Friday': start = this.startTime5; end = this.endTime5; break;
        case 'Saturday': start = this.startTime6; end = this.endTime6; break;
        case 'Sunday': start = this.startTime7; end = this.endTime7; break;
        default: continue;
      }
      if (end <= start) {
        this.invalidDays.push(day);
      }
    }
    return this.invalidDays.length === 0;
  }

  saveBusinessSettings() {
    if (!this.doctorId) return;
    if (!this.isValidBusinessHours()) {
      // Clear per-day errors after 3 seconds
      setTimeout(() => {
        this.invalidDays = [];
      }, 3000);
      return;
    }
    this.loading = true;
    const businessSettings: any = {
      selectedDays: this.selectedDays
    };
    this.selectedDays.forEach(day => {
      switch (day) {
        case 'Monday':
          businessSettings.startTime1 = this.startTime1;
          businessSettings.endTime1 = this.endTime1;
          break;
        case 'Tuesday':
          businessSettings.startTime2 = this.startTime2;
          businessSettings.endTime2 = this.endTime2;
          break;
        case 'Wednesday':
          businessSettings.startTime3 = this.startTime3;
          businessSettings.endTime3 = this.endTime3;
          break;
        case 'Thursday':
          businessSettings.startTime4 = this.startTime4;
          businessSettings.endTime4 = this.endTime4;
          break;
        case 'Friday':
          businessSettings.startTime5 = this.startTime5;
          businessSettings.endTime5 = this.endTime5;
          break;
        case 'Saturday':
          businessSettings.startTime6 = this.startTime6;
          businessSettings.endTime6 = this.endTime6;
          break;
        case 'Sunday':
          businessSettings.startTime7 = this.startTime7;
          businessSettings.endTime7 = this.endTime7;
          break;
      }
    });
    api.post('/doctor-settings', {
      doctorId: this.doctorId,
      businessSettings: [businessSettings]
    })
      .then(() => {
        this.loading = false;
        // Optionally show a success message
      })
      .catch(() => {
        this.loading = false;
        this.error = 'Failed to save business settings.';
      });
  }

  toggleTimePicker(value: string): void {

    if (this.showTimePicker[0] !== value) {
      this.showTimePicker[0] = value
    } else {
      this.showTimePicker = []
    }
  }
  formatTime(date: Date) {
    const selectedDate: Date = new Date(date)
    return this.datePipe.transform(selectedDate, 'h:mm a')
  }
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  
  selectDay(day: string): void {
    if (!this.selectedDays.includes(day)) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    }
  }
  isSelected(day: string): boolean {
    return this.selectedDays.includes(day);
  }
}
