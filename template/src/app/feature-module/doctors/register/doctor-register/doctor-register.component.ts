import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorRegistrationService } from '../doctor-registration.service';

@Component({
  selector: 'app-doctor-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-register.component.html',
  styleUrls: ['./doctor-register.component.scss']
})
export class DoctorRegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  togglePasswordClass = false;
  routes = {
    register: '/register',
    doctorRegisterStep1: '/doctors/register/doctor-register-step1',
    userLogin: '/login',
  };

  constructor(private router: Router, private regService: DoctorRegistrationService) {
    // Load data if present
    const data = this.regService.getAllData();
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.password = data.password || '';
  }

  togglePassword() {
    this.togglePasswordClass = !this.togglePasswordClass;
  }

  navigation() {
    // Save data to service
    this.regService.setStepData({
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password
    });
    this.router.navigate([this.routes.doctorRegisterStep1]);
  }
}
