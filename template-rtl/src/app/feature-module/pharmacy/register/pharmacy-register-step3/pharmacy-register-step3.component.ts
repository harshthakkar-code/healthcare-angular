import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-pharmacy-register-step3',
    templateUrl: './pharmacy-register-step3.component.html',
    styleUrls: ['./pharmacy-register-step3.component.scss'],
    standalone: false
})
export class PharmacyRegisterStep3Component {
  public routes = routes;
  displayStyle = 'none';

  toggleDisplay() {
    this.displayStyle = this.displayStyle === 'none' ? 'block' : 'none';
    console.log('aaa', this.displayStyle);
  }
}
