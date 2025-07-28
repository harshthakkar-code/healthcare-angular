import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorRegistrationService } from '../doctor-registration.service';
import { DataService } from 'src/app/shared/data/data.service';
import { environment } from 'src/environments/environment';
import { routes } from 'src/app/shared/routes/routes';
import { AuthService } from 'src/app/shared/auth/auth.service';
import api from 'src/app/shared/api/axios'; // <-- import your axios instance


declare const google: any;
declare const FB: any;


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
  selector: 'app-doctor-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-register.component.html',
  styleUrls: ['./doctor-register.component.scss'],
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
  registerError = '';
  passwordError: string[] = [];
  selectedCountry: any = 'IN'; // default
  countryOptions: { name: string; iso2: any; dialCode: string }[] = [];
  routes = {
    register: '/register',
    doctorRegisterStep1: '/doctors/register/doctor-register-step1',
    userLogin: '/login',
    registrationSuccess: '/doctors/register/registration-success',
    index: '',
  };
  iti: any;
  public googleClientId = environment.GOOGLE_CLIENT_ID;
  public routes1 = routes;

  constructor(
    private router: Router,
    private authService: AuthService,
    private regService: DoctorRegistrationService,
    private dataService: DataService
  ) {
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

  validatePassword() {
    const passwordErrors = [];
    if (!this.password.trim()) {
      passwordErrors.push('Password is required');
    } else {
      if (this.password.length < 8) {
        passwordErrors.push('Password must be at least 8 characters');
      }
      if (!/[A-Z]/.test(this.password)) {
        passwordErrors.push(
          'Password must include at least one uppercase letter'
        );
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

  validatePhone(): any | undefined {
    const dialCode = getCountryCallingCode(this.selectedCountry);
    const nationalOnly = this.phone.replace(/\D/g, '');
    const full = `+${dialCode}${nationalOnly}`;
    const parsed = parsePhoneNumberFromString(full, this.selectedCountry);

    if (!parsed || !parsed.isValid()) {
      this.phoneError = 'Invalid phone number for selected country';
      return undefined;
    }

    this.phoneError = '';
    return `${dialCode}-${parsed.nationalNumber}`;
  }

  navigation() {
    // Reset errors
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
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(this.email)
    ) {
      this.emailError = 'Invalid email format';
      valid = false;
    }

    const formattedPhone = this.validatePhone();
    if (!formattedPhone) valid = false;

    this.validatePassword();
    if (this.passwordError.length > 0) {
      valid = false;
    }

    if (!valid) {
      return; // Do not navigate if any field is invalid
    }

    // Save data to service and navigate
    this.regService.setStepData({
      name: this.name,
      email: this.email,
      phone: formattedPhone,
      password: this.password,
    });
    this.router.navigate([this.routes.doctorRegisterStep1]);
  }

  ngAfterViewInit(): void {
    // Load all countries with dial code
    this.countryOptions = getCountries()
      .map((iso2: any) => {
        const dialCode = getCountryCallingCode(iso2);
        return {
          name:
            new Intl.DisplayNames(['en'], { type: 'region' }).of(iso2) || iso2,
          iso2,
          dialCode,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // 2. Setup Google Sign-In
    (window as any).handleDoctorGoogleRegister = (response: any) => {
      const credential = response.credential;
      this.dataService.loginWithGoogle(credential).subscribe({
        next: (res: any) => {
          // Case: Existing registered user -> login
          if (res.token && res.user) {
            this.authService.setAuth(res.token, res.user);
            this.navigateByRole(res.user.role);
          }
          // Case: New user -> Prefill form and stay on current step
          else if (res.isNewUser && res.user) {
            this.name = res.user.name || '';
            this.email = res.user.email || '';
            this.registerError =
              res.message ||
              'Email not registered, please continue registration.';

            // Optional: store Google image or flag if needed
            this.regService.setStepData({
              name: this.name,
              email: this.email,
              profileImage: res.user.profileImage || '',
              // fromGoogle: true
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
        },
      });
    };

    // 3. Render Google Sign-In button
    setTimeout(() => {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (window as any).handleDoctorGoogleRegister,
        ux_mode: 'popup',
      });

      google.accounts.id.renderButton(
        document.getElementById('googleRegisterBtn')!,
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
        }
      );
    }, 0);
  }


  loginWithFacebook() {
  FB.login((response: any) => {
    console.log('FB login response:', response);

    if (response.authResponse) {
      const accessToken = response.authResponse.accessToken;
      console.log('Facebook Access Token:', accessToken);

      this.dataService.loginWithFacebook(accessToken).subscribe({
        next: (res: any) => {
          if (res.token && res.user) {
            // ✅ Auto-login for existing user
            this.authService.setAuth(res.token, res.user);
            this.navigateByRole(res.user.role);
          } else if (res.isNewUser && res.user) {
            // ✅ Prefill registration for new user
            this.name = res.user.name || '';
            this.email = res.user.email || '';
            this.registerError = res.message || 'Email not registered, please complete registration.';

            this.regService.setStepData({
              name: this.name,
              email: this.email,
              profileImage: res.user.profileImage || '',
              // fromFacebook: true
            });

            setTimeout(() => {
              this.registerError = '';
            }, 3000);
          }
        },
        error: (err: any) => {
          console.error('Facebook login error', err);
          this.registerError = err.error?.message || 'Facebook login failed';
          setTimeout(() => {
            this.registerError = '';
          }, 3000);
        }
      });

    } else {
      console.error('User cancelled Facebook login or did not authorize.');
    }
  }, { scope: 'email' });
}


  navigateByRole(role: string) {
    if (role === 'doctor') {
      this.router.navigate(['/doctors/doctor-dashboard']);
      // this.router.navigate([this.routes.index]);
    } else if (role === 'patient') {
      // this.router.navigate(['/patients/patient-dashboard']);
      this.router.navigate([this.routes1.index]);
    } else if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate([this.routes1.index]);
    }
  }
}
