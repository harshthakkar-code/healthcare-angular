import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-doctor-grid',
  standalone: false,
  
  templateUrl: './doctor-grid.component.html',
  styleUrl: './doctor-grid.component.scss'
})
export class DoctorGridComponent {
routes =routes;
minvalue = 251;
maxvalue = 401;
isMore:boolean[]=[false];
viewMore(index:number):void{
  this.isMore[index]=!this.isMore[index]
}
}
