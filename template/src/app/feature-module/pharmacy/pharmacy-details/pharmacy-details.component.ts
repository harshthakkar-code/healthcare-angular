import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import lgZoom from 'lightgallery/plugins/zoom';
import { BeforeSlideDetail } from 'lightgallery/lg-events';
@Component({
    selector: 'app-pharmacy-details',
    templateUrl: './pharmacy-details.component.html',
    styleUrls: ['./pharmacy-details.component.scss'],
    standalone: false
})
export class PharmacyDetailsComponent {
  public routes = routes;
  settings = {
    counter: false,
    plugins: [lgZoom],
  };
  onBeforeSlide = (detail: BeforeSlideDetail): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { index, prevIndex } = detail;
  };
}
