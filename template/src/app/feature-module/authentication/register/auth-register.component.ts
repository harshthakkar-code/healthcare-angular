import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import intlTelInput from 'intl-tel-input';
import { PatientRegistrationService } from 'src/app/feature-module/patients/register/patient-registration.service';
@Component({
    selector: 'app-auth-register',
    templateUrl: './auth-register.component.html',
    styleUrls: ['./auth-register.component.scss'],
    standalone: false
})
export class AuthRegisterComponent {
  public routes = routes;
  name: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  gender: string = '';
  nameError = '';
  emailError = '';
  phoneError = '';
  passwordError = '';
  constructor(private router: Router, private patientRegistrationService: PatientRegistrationService) {}

  public togglePasswordClass = false;
  togglePassword() {
    this.togglePasswordClass = !this.togglePasswordClass;
  }
  public navigation() {
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
      return;
    }

    this.patientRegistrationService.setStepData({
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      gender: this.gender ? this.gender.toLowerCase() : ''
    });
    this.router.navigateByUrl('/patients/register/patient-register-step1');
  }
  ngAfterViewInit(): void {
    const input = document.querySelector('#phone') as HTMLInputElement;
    intlTelInput(input, {
      initialCountry: 'us',
      preferredCountries: ['us', 'gb', 'in'],
      utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js'
    }as any);
    // Restrict input to numbers, "+", and allowed characters
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9+()-\s]/g, ''); // Removes any character not allowed
    });
        
  }
}
