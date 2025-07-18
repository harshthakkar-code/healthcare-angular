import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorRegistrationService, DoctorRegistrationData } from '../doctor-registration.service';
import api from 'src/app/shared/api/axios';

@Component({
  selector: 'app-doctor-register-step3',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-register-step3.component.html',
  styleUrls: ['./doctor-register-step3.component.scss']
})
export class DoctorRegisterStep3Component {
  city = '';
  state = '';
  cityError = '';
  stateError = '';

  constructor(private router: Router, private regService: DoctorRegistrationService) {
    const data = this.regService.getAllData();
    this.city = data.city || '';
    this.state = data.state || '';
  }

  async update() {
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
    if (!valid) {
      return;
    }

    this.regService.setStepData({ city: this.city, state: this.state });
    const allData: DoctorRegistrationData = this.regService.getAllData();
    const payload = {
      ...allData,
      role: 'doctor',
      height: allData.height,
      clinicAddress: allData.clinicAddress,
      pincode: allData.pincode
    };
    console.log('Doctor Registration Data:', payload);
    try {
      const response = await api.post('/auth/register', payload);
      console.log('Registration API Success:', response.data);
      this.regService.clear();
      this.router.navigate(['/authentication/register/registration-success']);
    } catch (error) {
      console.error('Registration API Error:', error);
    }
  }
}
