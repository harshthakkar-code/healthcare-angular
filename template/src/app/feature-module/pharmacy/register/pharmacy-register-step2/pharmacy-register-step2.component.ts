import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-pharmacy-register-step2',
    templateUrl: './pharmacy-register-step2.component.html',
    styleUrls: ['./pharmacy-register-step2.component.scss'],
    standalone: false
})
export class PharmacyRegisterStep2Component {
  public routes = routes;

}
