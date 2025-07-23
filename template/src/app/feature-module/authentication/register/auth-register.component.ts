import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import intlTelInput from 'intl-tel-input';
import { PatientRegistrationService } from 'src/app/feature-module/patients/register/patient-registration.service';
import { DataService } from 'src/app/shared/data/data.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/auth/auth.service';

declare const google: any;
function loadIntlTelInputUtilsScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).intlTelInputUtils) {
      resolve();
      return;
    }
    const existingScript = document.querySelector('script[data-iti-utils]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if ((window as any).intlTelInputUtils) {
          resolve();
        } else {
          reject();
        }
      });
      existingScript.addEventListener('error', () => reject());
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.setAttribute('data-iti-utils', 'true');
    script.onload = () => {
      if ((window as any).intlTelInputUtils) {
        resolve();
      } else {
        reject();
      }
    };
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}

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
  registerError = '';
  passwordError: string[] = [];
  iti: any;
  constructor(private router: Router, private patientRegistrationService: PatientRegistrationService,private authService: AuthService , private dataService: DataService) {}

  public togglePasswordClass = false;
  public googleClientId = environment.GOOGLE_CLIENT_ID;

  togglePassword() {
    this.togglePasswordClass = !this.togglePasswordClass;
  }
  validatePassword() {
    const passwordErrors = [];
    if (!this.password.trim()) {
      passwordErrors.push('Password is required');
    } else {
      if (this.password.length < 8) {
        passwordErrors.push('Password must be at least 8 characters');
      }
      if (!/[A-Z]/.test(this.password)) {
        passwordErrors.push('Password must include at least one uppercase letter');
      }
      if (!/[0-9]/.test(this.password)) {
        passwordErrors.push('Password must include at least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=;'/\\\[\]`~]/.test(this.password)) {
        passwordErrors.push('Password must include at least one symbol');
      }
    }
    this.passwordError = passwordErrors;
  }
  public navigation() {
    this.nameError = '';
    this.emailError = '';
    this.phoneError = '';
    this.passwordError = [];

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

    
    this.validatePassword();
    if (this.passwordError.length > 0) {
      valid = false;
    }
    if (!valid) {
      return;
    }

    // Combine country code and phone number
    let combinedPhone = this.phone;
if (this.iti) {
  combinedPhone = this.iti.getNumber(); // This gives +91xxxxxxxxxx
}


    this.patientRegistrationService.setStepData({
      name: this.name,
      email: this.email,
      phone: combinedPhone,
      password: this.password,
      gender: this.gender ? this.gender.toLowerCase() : ''
    });
    this.router.navigateByUrl('/patients/register/patient-register-step1');
  }
ngAfterViewInit(): void {
  // 1. Setup intlTelInput
  const input = document.querySelector('#phone') as HTMLInputElement;
  this.iti = intlTelInput(input, {
    initialCountry: 'us',
    preferredCountries: ['us', 'gb', 'in'],
    utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js'
  } as any);
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9+()-\s]/g, '');
  });

  // 2. Setup Google Sign-In handler
  (window as any).handlePatientGoogleRegister = (response: any) => {
    const credential = response.credential;
    this.dataService.loginWithGoogle(credential).subscribe({
      next: (res: any) => {
        // Case: Existing user, redirect to dashboard
        if (res.token && res.user) {
          this.authService.setAuth(res.token, res.user);
          this.navigateByRole(res.user.role);
        }
        // Case: New user, prefill registration form
        else if (res.isNewUser && res.user) {
          this.name = res.user.name || '';
          this.email = res.user.email || '';
          this.registerError = res.message || 'Email not registered, please complete registration.';

          this.patientRegistrationService.setStepData({
            name: this.name,
            email: this.email,
            profileImage: res.user.profileImage || '',
            fromGoogle: true
          });

          setTimeout(() => {
            this.registerError = '';
          }, 3000);
        }
      },
      error: (err: any) => {
        console.error('Google login error', err);
        this.registerError = err.error?.message || 'Google login failed';
        setTimeout(() => {
          this.registerError = '';
        }, 3000);
      }
    });
  };

  // 3. Render Google Sign-In button
  setTimeout(() => {
    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (window as any).handlePatientGoogleRegister,
      ux_mode: 'popup',
    });

    google.accounts.id.renderButton(
      document.getElementById("googleRegisterBtn")!,
      {
        theme: "outline",
        size: "large",
        type: "standard",
        text: "continue_with",
        shape: "rectangular"
      }
    );
  }, 0);
}
  navigateByRole(role: string) {
    if (role === 'doctor') {
      this.router.navigate(['/doctors/doctor-dashboard']);
      // this.router.navigate([this.routes.index]);
    } else if (role === 'patient') {
      // this.router.navigate(['/patients/patient-dashboard']);
      this.router.navigate([this.routes.index]);
    } else if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate([this.routes.index]);
    }
  }
}
