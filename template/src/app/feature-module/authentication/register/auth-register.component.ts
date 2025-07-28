import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from 'src/app/feature-module/patients/register/patient-registration.service';
import { DataService } from 'src/app/shared/data/data.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/auth/auth.service';

declare const google: any;
declare const FB: any;

@Component({
  selector: 'app-auth-register',
  templateUrl: './auth-register.component.html',
  styleUrls: ['./auth-register.component.scss'],
  standalone: false,
})
export class AuthRegisterComponent implements OnInit {
  public routes = routes;
  name: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  gender: string = '';
  selectedCountry: any = 'IN'; // default
  countryOptions: { name: string; iso2: any; dialCode: string }[] = [];

  nameError = '';
  emailError = '';
  phoneError = '';
  registerError = '';
  passwordError: string[] = [];
  // iti: any;

  constructor(
    private router: Router,
    private patientRegistrationService: PatientRegistrationService,
    private authService: AuthService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
     FB.init({
    // appId: '1203689977478567',
    appId: environment.FACEBOOK_APP_ID,
    cookie: true,
    xfbml: true,
    version: 'v19.0' // Or latest
  });

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
  }

  public togglePasswordClass = false;
  public googleClientId = environment.GOOGLE_CLIENT_ID;

  togglePassword() {
    this.togglePasswordClass = !this.togglePasswordClass;
  }

  validatePassword() {
    const errors: string[] = [];
    if (!this.password.trim()) {
      errors.push('Password is required');
    } else {
      if (this.password.length < 8)
        errors.push('Password must be at least 8 characters');
      if (!/[A-Z]/.test(this.password))
        errors.push('Include one uppercase letter');
      if (!/[0-9]/.test(this.password)) errors.push('Include one number');
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=;'/\\[\]`~]/.test(this.password))
        errors.push('Include one symbol');
    }
    this.passwordError = errors;
  }

  validateEmail(): boolean {
    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      return false;
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(this.email)
    ) {
      this.emailError = 'Invalid email format';
      return false;
    }
    this.emailError = '';
    return true;
  }

  validateName(): boolean {
    if (!this.name.trim()) {
      this.nameError = 'Name is required';
      return false;
    }
    this.nameError = '';
    return true;
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

  public navigation() {
    this.nameError = '';
    this.emailError = '';
    this.phoneError = '';
    this.passwordError = [];

    let valid = true;

    if (!this.validateName()) valid = false;
    if (!this.validateEmail()) valid = false;

    const formattedPhone = this.validatePhone();
    if (!formattedPhone) valid = false;

    this.validatePassword();
    if (this.passwordError.length > 0) valid = false;

    if (!valid) return;

    this.patientRegistrationService.setStepData({
      name: this.name,
      email: this.email,
      phone: formattedPhone, // ✅ "91-9985699655"
      password: this.password,
      gender: this.gender ? this.gender.toLowerCase() : '',
    });

    this.router.navigateByUrl('/patients/register/patient-register-step1');
  }

  ngAfterViewInit(): void {
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
            this.registerError =
              res.message ||
              'Email not registered, please complete registration.';

            this.patientRegistrationService.setStepData({
              name: this.name,
              email: this.email,
              profileImage: res.user.profileImage || '',
              fromGoogle: true,
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
        callback: (window as any).handlePatientGoogleRegister,
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

            this.patientRegistrationService.setStepData({
              name: this.name,
              email: this.email,
              profileImage: res.user.profileImage || '',
              fromFacebook: true
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
      this.router.navigate([this.routes.index]);
    } else if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate([this.routes.index]);
    }
  }
}
