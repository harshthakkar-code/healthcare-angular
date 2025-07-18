import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-success',
  templateUrl: './registration-success.component.html',
  styleUrls: ['./registration-success.component.scss']
})
export class RegistrationSuccessComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/authentication/login']);
  }
} 