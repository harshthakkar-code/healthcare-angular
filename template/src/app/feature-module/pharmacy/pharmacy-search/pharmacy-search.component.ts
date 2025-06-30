import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-pharmacy-search',
    templateUrl: './pharmacy-search.component.html',
    styleUrls: ['./pharmacy-search.component.scss'],
    standalone: false
})
export class PharmacySearchComponent {
  public routes = routes;

}
