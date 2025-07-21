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
  currentStep = 5;

  constructor(private patientRegService: PatientRegistrationService, private router: Router) {
    const data = this.patientRegService.getAllData();
    this.city = data['city'] || '';
    this.state = data['state'] || '';
  }

  goToStep(step: number) {
    if (step === 1) {
      this.router.navigate(['/patients/register/patient-register-step1']);
    } else if (step === 2) {
      this.router.navigate(['/patients/register/patient-register-step2']);
    } else if (step === 3) {
      this.router.navigate(['/patients/register/patient-register-step3']);
    } else if (step === 4) {
      this.router.navigate(['/patients/register/patient-register-step4']);
    } else if (step === 5) {
      // Already on step 5
    }
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
      this.router.navigate(['/authentication/register/registration-success']);
    } catch (error) {
      const err = error as any;
      console.error('Registration failed:', err.response?.data || err.message);
      // Optionally show error to user
    }
  }
}
