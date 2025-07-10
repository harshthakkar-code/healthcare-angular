import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
import { DataService } from 'src/app/shared/data/data.service';
import { NgForm } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/auth/auth.service';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  public routes = routes;
  public email = '';
  public password = '';
  public otp = '';
  public useOtp = false;
  public otpRequested = false;
  public errorMessage = '';
  public otpMessage = '';
  public submitted = false;
  public googleError = '';
  public googleClientId = environment.GOOGLE_CLIENT_ID;
  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }
  public togglePasswordClass = false;
  togglePassword() {
    this.togglePasswordClass = !this.togglePasswordClass;
  }
  navigation(): void {
    this.router.navigate([routes.index]);
  }

  ngOnInit() {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Register the callback globally for Google
    (window as any).handleGoogleLogin = (response: any) => this.handleGoogleLogin(response);
  }

  async login(form?: NgForm) {
    this.submitted = true;
    this.errorMessage = '';
    this.otpMessage = '';
    if (form && !form.valid) {
      return;
    }
    if (this.useOtp) {
      if (!this.otpRequested) {
        // Request OTP
        if (!this.email) return;
        this.dataService.requestOtp(this.email).subscribe({
          next: (res) => {
            this.otpRequested = true;
            this.otpMessage = 'OTP sent to your email.';
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Failed to send OTP';
          }
        });
        return;
      } else {
        // Login with OTP
        if (!this.email || !this.otp) return;
        this.dataService.loginWithOtp(this.email, this.otp).subscribe({
          next: (response) => {
            this.authService.setAuth(response.token, response.user);
            this.navigateByRole(response.user.role);
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'OTP login failed';
          }
        });
        return;
      }
    } else {
      // Password login
      if (!this.email || !this.password) return;
      try {
        const response = await api.post('/auth/login', {
          email: this.email,
          password: this.password
        });
        this.authService.setAuth(response.data.token, response.data.user);
        this.navigateByRole(response.data.user.role);
      } catch (error: any) {
        this.errorMessage = error.response?.data?.message || 'Login failed';
      }
    }
  }
  isEmailInvalid(form: NgForm) {
    const emailCtrl = form.controls['email'];
    return emailCtrl && emailCtrl.invalid && (emailCtrl.touched || this.submitted);
  }
  isPasswordInvalid(form: NgForm) {
    const passwordCtrl = form.controls['password'];
    return passwordCtrl && passwordCtrl.invalid && (passwordCtrl.touched || this.submitted);
  }

  handleGoogleLogin(response: any) {
    const token = response.credential;
    this.dataService.loginWithGoogle(token).subscribe({
      next: (res) => {
        this.authService.setAuth(res.token, res.user);
        this.navigateByRole(res.user.role);
      },
      error: (err) => {
        this.googleError = err.error?.message || 'Google login failed';
      }
    });
  }

  navigateByRole(role: string) {
    if (role === 'doctor') {
      this.router.navigate(['/doctors/doctor-dashboard']);
    } else if (role === 'patient') {
      this.router.navigate(['/patients/patient-dashboard']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate([this.routes.index]);
    }
  }
}
