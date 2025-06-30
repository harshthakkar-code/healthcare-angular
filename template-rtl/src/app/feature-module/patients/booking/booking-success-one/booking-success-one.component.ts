import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-booking-success-one',
    templateUrl: './booking-success-one.component.html',
    styleUrls: ['./booking-success-one.component.scss'],
    standalone: false
})
export class BookingSuccessOneComponent {
  public routes = routes;

}
