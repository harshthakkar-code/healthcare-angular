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
  constructor(private router: Router, private patientRegistrationService: PatientRegistrationService) {}

  public togglePasswordClass = false;
  togglePassword() {
    this.togglePasswordClass = !this.togglePasswordClass;
  }
  public navigation() {
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
