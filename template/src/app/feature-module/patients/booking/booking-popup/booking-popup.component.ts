import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-booking-popup',
  standalone: false,
  
  templateUrl: './booking-popup.component.html',
  styleUrl: './booking-popup.component.scss'
})
export class BookingPopupComponent {
  routes=routes;
  public selectedFieldSet = [0];
  bsInlineValue = new Date();
  isShow=true;
  isClinic=true;
  ngOnInit():void{
    this.isShow=true;
  }
  ngOnDestroy():void{
    this.isShow=false;
  }
  showClinic():void{
    this.isClinic=true;
  }
  offClinic():void{
    this.isClinic=false;
  }
}
