import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
@Component({
    selector: 'app-login-email',
    templateUrl: './login-email.component.html',
    styleUrls: ['./login-email.component.scss'],
    standalone: false
})
export class LoginEmailComponent {
  public routes = routes;
  public email = '';
  public password = '';
  public errorMessage = '';
  public togglePasswordClass = false;

  constructor(private router: Router) {}

  public navigation() {
    this.router.navigate([routes.loginEmailOtp]);
  }
  togglePassword() {
    this.togglePasswordClass = !this.togglePasswordClass;
  }

  async login() {
    this.errorMessage = '';
    try {
      const response = await api.post('/auth/login', {
        email: this.email,
        password: this.password
      });
      localStorage.setItem('token', response.data.token);
      this.router.navigate([this.routes.index]);
    } catch (error: any) {
      this.errorMessage = error.response?.data?.message || 'Login failed';
    }
  }
}
