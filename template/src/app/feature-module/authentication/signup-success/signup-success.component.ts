import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-signup-success',
    templateUrl: './signup-success.component.html',
    styleUrls: ['./signup-success.component.scss'],
    standalone: false
})
export class SignupSuccessComponent {
  public routes = routes;
  constructor(private router: Router) {}

  public navigation() {
    this.router.navigate([routes.loginEmail]);
  }
}
