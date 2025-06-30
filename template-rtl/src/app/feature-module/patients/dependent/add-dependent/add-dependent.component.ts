import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-add-dependent',
    templateUrl: './add-dependent.component.html',
    styleUrls: ['./add-dependent.component.scss'],
    standalone: false
})
export class AddDependentComponent {
  public routes = routes;

}
