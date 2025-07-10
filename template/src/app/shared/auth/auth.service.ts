import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  setAuth(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', user.id);
    localStorage.setItem('role', user.role);
    if (user.role === 'patient') {
      localStorage.setItem('authenticated-patient', 'true');
    } else if (user.role === 'doctor') {
      localStorage.setItem('authenticated-doctor', 'true');
    } else if (user.role === 'admin') {
      localStorage.setItem('authenticated-admin', 'true');
    } else if (user.role === 'pharmacy') {
      localStorage.setItem('authenticated-pharmacy', 'true');
    }
  }

  isAuthenticated(role: string): boolean {
    if (role === 'patient') {
      return !!localStorage.getItem('authenticated-patient');
    } else if (role === 'doctor') {
      return !!localStorage.getItem('authenticated-doctor');
    } else if (role === 'admin') {
      return !!localStorage.getItem('authenticated-admin');
    } else if (role === 'pharmacy') {
      return !!localStorage.getItem('authenticated-pharmacy');
    }
    return false;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('authenticated-patient');
    localStorage.removeItem('authenticated-doctor');
    localStorage.removeItem('authenticated-admin');
    localStorage.removeItem('authenticated-pharmacy');
  }
} 