import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from '../patient-registration.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-patient-register-step5',
    templateUrl: './patient-register-step5.component.html',
    styleUrls: ['./patient-register-step5.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule]
})
export class PatientRegisterStep5Component {
  public routes = routes;

  city: string = '';
  state: string = '';
  cityError: string = '';
  stateError: string = '';

  constructor(private patientRegService: PatientRegistrationService, private router: Router) {
    const data = this.patientRegService.getAllData();
    this.city = data['city'] || '';
    this.state = data['state'] || '';
  }

  async onComplete() {
    this.cityError = '';
    this.stateError = '';
    let valid = true;
    if (!this.city.trim()) {
      this.cityError = 'City is required';
      valid = false;
    }
    if (!this.state.trim()) {
      this.stateError = 'State is required';
      valid = false;
    }
    if (!valid) return;
    this.patientRegService.setStepData({
      city: this.city,
      state: this.state
    });
    const allData = this.patientRegService.getAllData();
    const payload = { ...allData, role: 'patient' };
    try {
      const response = await api.post('/auth/register', payload);
      console.log('Registration successful:', response.data);
      this.patientRegService.clear();
      this.router.navigate([this.routes.patientDashboard]);
    } catch (error) {
      const err = error as any;
      console.error('Registration failed:', err.response?.data || err.message);
      // Optionally show error to user
    }
  }
}
