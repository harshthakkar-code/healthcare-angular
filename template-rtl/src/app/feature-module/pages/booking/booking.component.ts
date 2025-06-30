import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-booking',
  standalone: false,
  
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent {
  routes=routes;
  public selectedFieldSet = [0];
  bsInlineValue = new Date();
  isClinic=true;
  showClinic():void{
    this.isClinic=true;
  }
  offClinic():void{
    this.isClinic=false;
  }
}
