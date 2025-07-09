import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import api from 'src/app/shared/api/axios';
import { from } from 'rxjs';
import { Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
    standalone: false
})
export class ChangePasswordComponent {
  public routes = routes;

  public password: boolean[] = [false, false, false];
  public oldPassword = '';
  public newPassword = '';
  public confirmPassword = '';
  public loading = false;

  public oldPasswordError = '';
  public newPasswordError = '';
  public confirmPasswordError = '';
  public passwordMismatchError = '';
  public successMessage = '';

  private passwordChangedSource = new Subject<string>();
  public passwordChanged$ = this.passwordChangedSource.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  public togglePassword(index: number) {
    this.password[index] = !this.password[index];
  }

  public onSubmit() {
    this.oldPasswordError = '';
    this.newPasswordError = '';
    this.confirmPasswordError = '';
    this.passwordMismatchError = '';
    this.successMessage = '';
    let hasError = false;
    if (!this.oldPassword) {
      this.oldPasswordError = 'Current password is required';
      hasError = true;
    }
    if (!this.newPassword) {
      this.newPasswordError = 'New password is required';
      hasError = true;
    }
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Confirm password is required';
      hasError = true;
    }
    if (this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword) {
      this.passwordMismatchError = 'New password and confirm password do not match';
      hasError = true;
    }
    if (hasError) return;
    this.loading = true;
    from(
      api.put('/patient/change-password', {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      })
    ).subscribe({
      next: (res: any) => {
        // this.toastr.success(res.data?.message || 'Password changed successfully');
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.loading = false;
        this.successMessage = res.data?.message || 'Password changed successfully';
        this.passwordChangedSource.next(this.successMessage);
        // Logout after short delay
        setTimeout(() => {
          localStorage.clear();
          this.router.navigate([this.routes.userLogin]);
        }, 1500);
      },
      error: (err) => {
        // this.toastr.error(err.response?.data?.message || 'Failed to change password');
        this.loading = false;
        this.oldPasswordError = err.response?.data?.message || 'Failed to change password';
      }
    });
  }
}
