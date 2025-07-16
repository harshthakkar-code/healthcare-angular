import { Component, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorRegistrationService } from '../doctor-registration.service';
import intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-doctor-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-register.component.html',
  styleUrls: ['./doctor-register.component.scss']
})
export class DoctorRegisterComponent implements AfterViewInit {
  name = '';
  email = '';
  phone = '';
  password = '';
  togglePasswordClass = false;
  nameError = '';
  emailError = '';
  phoneError = '';
  passwordError = '';
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
    // Reset errors
    this.nameError = '';
    this.emailError = '';
    this.phoneError = '';
    this.passwordError = '';

    let valid = true;

    if (!this.name.trim()) {
      this.nameError = 'Name is required';
      valid = false;
    }
    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      valid = false;
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(this.email)) {
      this.emailError = 'Invalid email format';
      valid = false;
    }
    if (!this.phone.trim()) {
      this.phoneError = 'Phone is required';
      valid = false;
    } else if (!/^[0-9]{10,15}$/.test(this.phone.replace(/\D/g, ''))) {
      this.phoneError = 'Invalid phone number';
      valid = false;
    }
    if (!this.password.trim()) {
      this.passwordError = 'Password is required';
      valid = false;
    }

    if (!valid) {
      return; // Do not navigate if any field is invalid
    }

    // Save data to service and navigate
    this.regService.setStepData({
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password
    });
    this.router.navigate([this.routes.doctorRegisterStep1]);
  }

  ngAfterViewInit(): void {
    const input = document.querySelector('#phone') as HTMLInputElement;
    intlTelInput(input, {
      initialCountry: 'us',
      preferredCountries: ['us', 'gb', 'in'],
      utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js'
    } as any);
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9+()-\s]/g, '');
    });
  }
}
