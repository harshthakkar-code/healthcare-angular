import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent {
  public routes = routes;
  public email = '';
  public password = '';
  public errorMessage = '';
  constructor(private router: Router) { }
  public togglePasswordClass = false;
  togglePassword() {
    this.togglePasswordClass = !this.togglePasswordClass;
  }
  navigation(): void {
    this.router.navigate([routes.index]);
  }

  async login() {
    this.errorMessage = '';
    try {
      const response = await api.post('/auth/login', {
        email: this.email,
        password: this.password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('role', response.data.user.role);
      this.router.navigate([this.routes.index]);
    } catch (error: any) {
      this.errorMessage = error.response?.data?.message || 'Login failed';
    }
  }
}
