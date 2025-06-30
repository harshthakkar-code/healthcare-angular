import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-general-home',
  standalone: false,
  
  templateUrl: './general-home.component.html',
  styleUrl: './general-home.component.scss'
})
export class GeneralHomeComponent {
public routes=routes;
time: Date | null = null; // Bind this to the p-calendar
bsValue=new Date();
constructor(public router:Router){}
public spcialitySlider : OwlOptions={
  loop: true,
			margin: 24,
			dots: false,
			nav: true,
			smartSpeed: 2000,
			navText: ['<i class="fa-solid fa-chevron-left"></i>', '<i class="fa-solid fa-chevron-right"></i>'],
			responsive: {
				0: {
					items: 2
				},
				500: {
					items: 3
				},
				768: {
					items: 4
				},
				992: {
					items: 6
				},
				1200: {
					items: 8
				}
			}
}
public doctorSlider : OwlOptions={
  loop: true,
			margin: 24,
			dots: false,
			nav: true,
			smartSpeed: 2000,
			navText: ['<i class="isax isax-arrow-left"></i>', '<i class="isax isax-arrow-right-1"></i>'],
			responsive: {
				0: {
					items: 1
				},
				768: {
					items: 2
				},
				992: {
					items: 4
				},
				1300: {
					items: 4
				}
			}
}
public testimonialSlider:OwlOptions={
  loop: true,
			margin: 24,
			dots: false,
			nav: false,
			smartSpeed: 2000,
			responsive: {
				0: {
					items: 1
				},
				768: {
					items: 2
				},
				992: {
					items: 3
				}
			}
}
navigate(){
	this.router.navigate([routes.search2])
}
}
