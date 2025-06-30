import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-pharmacy-register-step1',
    templateUrl: './pharmacy-register-step1.component.html',
    styleUrls: ['./pharmacy-register-step1.component.scss'],
    standalone: false
})
export class PharmacyRegisterStep1Component {
  public routes = routes;

}
