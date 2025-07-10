import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard  {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated('admin')) {
      return this.router.createUrlTree(['']);
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PharmacyAuthGuard  {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const authenticatedPharmacy = localStorage.getItem('authenticated-pharmacy');

    if (!authenticatedPharmacy) {
      return this.router.createUrlTree(['pharmacy/pharmacy-login']);
    }

    return true;
  }
}

@Injectable({
  providedIn: 'root',
})
export class DoctorAuthGuard  {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated('doctor')) {
      return this.router.createUrlTree(['']);
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PatientAuthGuard  {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated('patient')) {
      return this.router.createUrlTree(['']);
    }
    return true;
  }
}