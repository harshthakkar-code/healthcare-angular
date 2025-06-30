import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { DataService } from 'src/app/shared/data/data.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    standalone: false
})
export class ForgotPasswordComponent {
  public routes = routes;
  public email = '';
  public otp = '';
  public otpRequested = false;
  public otpVerified = false;
  public errorMessage = '';
  public otpMessage = '';
  constructor(private router: Router, private dataService: DataService) {}

  public requestOtp() {
    this.errorMessage = '';
    this.otpMessage = '';
    this.dataService.forgotPasswordRequest(this.email).subscribe({
      next: (res) => {
        this.otpRequested = true;
        this.otpMessage = 'OTP sent to your email.';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to send OTP';
      }
    });
  }

  public verifyOtp() {
    this.errorMessage = '';
    this.otpMessage = '';
    this.dataService.forgotPasswordVerify(this.email, this.otp).subscribe({
      next: (res) => {
        this.otpVerified = true;
        this.otpMessage = 'OTP verified. Redirecting...';
        setTimeout(() => {
          this.router.navigate(['authentication/reset-password'], { queryParams: { email: this.email } });
        }, 1000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'OTP verification failed';
      }
    });
  }
}
