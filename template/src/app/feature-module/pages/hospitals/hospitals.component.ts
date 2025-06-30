import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-hospitals',
  standalone: false,
  
  templateUrl: './hospitals.component.html',
  styleUrl: './hospitals.component.scss'
})
export class HospitalsComponent {
routes = routes
currentStep = 1

changeContent(res:number) {
    this.currentStep = res
}

}
