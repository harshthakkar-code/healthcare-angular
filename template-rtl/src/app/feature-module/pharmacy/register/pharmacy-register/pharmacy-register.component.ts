import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-pharmacy-register',
    templateUrl: './pharmacy-register.component.html',
    styleUrls: ['./pharmacy-register.component.scss'],
    standalone: false
})
export class PharmacyRegisterComponent {
  public routes = routes;
  constructor(private router: Router) {}

  public navigation() {
    this.router.navigate([routes.pharmacyRegisterStep1]);
  }
}
