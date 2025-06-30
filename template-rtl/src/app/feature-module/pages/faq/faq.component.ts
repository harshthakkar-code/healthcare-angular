import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss'],
    standalone: false
})
export class FaqComponent {
  public routes = routes;

}
