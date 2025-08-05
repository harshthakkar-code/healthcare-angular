import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-general-home',
  standalone: false,
  
  templateUrl: './general-home.component.html',
  styleUrl: './general-home.component.scss'
})
export class GeneralHomeComponent implements OnInit {
  featuredDoctors: any[] = [];
  featuredDoctorsLimit = 6; // Set to your current API limit
  loading = false;
  reviews: any[] = [];
  reviewLimit = 6;
  specializationCounts: any[] = [];
  userRole: string | null = null;

  staticSpecialties = [
    { name: 'Cardiology', img: 'assets/img/specialities/speciality-01.jpg', icon: 'assets/img/specialities/speciality-icon-01.svg' },
    { name: 'Orthopedics', img: 'assets/img/specialities/speciality-02.jpg', icon: 'assets/img/specialities/speciality-icon-02.svg' },
    { name: 'Neurology', img: 'assets/img/specialities/speciality-03.jpg', icon: 'assets/img/specialities/speciality-icon-03.svg' },
    { name: 'Pediatrics', img: 'assets/img/specialities/speciality-04.jpg', icon: 'assets/img/specialities/speciality-icon-04.svg' },
    { name: 'Psychiatry', img: 'assets/img/specialities/speciality-05.jpg', icon: 'assets/img/specialities/speciality-icon-05.svg' },
    { name: 'Endocrinology', img: 'assets/img/specialities/speciality-06.jpg', icon: 'assets/img/specialities/speciality-icon-06.svg' },
    { name: 'Pulmonology', img: 'assets/img/specialities/speciality-07.jpg', icon: 'assets/img/specialities/speciality-icon-07.svg' },
    { name: 'Urology', img: 'assets/img/specialities/speciality-08.jpg', icon: 'assets/img/specialities/speciality-icon-08.svg' }
  ];

  getSpecialtyCount(name: string): number {
    const found = this.specializationCounts.find(s => s.name.toLowerCase() === name.toLowerCase());
    return found ? found.count : 10;
  }

  getSpecializationClass(specialization: string): string {
    if (!specialization) return 'text-indigo'; // default
    switch (specialization.toLowerCase()) {
      case 'psychologist': return 'text-indigo';
      case 'pediatrician': return 'text-pink';
      case 'neurologist': return 'text-teal';
      case 'cardiologist': return 'text-info';
      // Add more as needed to match your static mapping
      default: return 'text-indigo';
    }
  }

  getActiveBarClass(specialization: string): string {
    if (!specialization) return 'active-bar';
    switch (specialization.toLowerCase()) {
      case 'psychologist': return 'active-bar';
      case 'pediatrician': return 'active-bar-pink';
      case 'neurologist': return 'active-bar-teal';
      case 'cardiologist': return 'active-bar-info';
      // Add more as needed to match your static mapping
      default: return 'active-bar';
    }
  }

  async ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userRole = user.role || null;
    this.loading = true;
    try {
      const res = await api.get('/doctor/public', {
        params: {
          page: 1,
          limit: this.featuredDoctorsLimit,
          sort: 'rating', // adjust if your backend uses a different param
          order: 'desc'
        }
      });
      this.featuredDoctors = (res.data.data || []).filter((doc: any) => doc.isApproved = 'true');
      // Compute max service price for each doctor
      this.featuredDoctors.forEach((doc: any) => {
        let prices: number[] = [];
        if (Array.isArray(doc.services) && doc.services.length > 0) {
          const flatServices = doc.services.flat();
          prices.push(...flatServices
            .map((s: any) => typeof s.price === 'number' ? s.price : null)
            .filter((p: number | null) => p !== null));
        }
        if (Array.isArray(doc.specializations) && doc.specializations.length > 0) {
          doc.specializations.forEach((spec: any) => {
            if (Array.isArray(spec.services)) {
              prices.push(...spec.services
                .map((s: any) => typeof s.price === 'number' ? s.price : null)
                .filter((p: number | null) => p !== null));
            }
          });
        }
        doc.fees = prices.length > 0 ? Math.max(...prices) : null;
      });
    } catch (err) {
      this.featuredDoctors = [];
    }
    await this.fetchReviews();
    await this.fetchSpecializationCounts();
    this.loading = false;
  }

  async fetchReviews() {
    try {
      const res = await api.get('/reviews');
      this.reviews = (res.data.reviews || []).slice(0, this.reviewLimit);
    } catch (err) {
      this.reviews = [];
    }
  }

  async fetchSpecializationCounts() {
    try {
      const res = await api.get('/specialization/count-by-name');
      this.specializationCounts = res.data || [];
    } catch (err) {
      this.specializationCounts = [];
    }
  }
public routes=routes;
time: Date | null = null; // Bind this to the p-calendar
bsValue=new Date();
constructor(public router:Router, private authService: AuthService){}
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
      items: 3
    },
    1200: {
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
goToDoctorProfile(doctorId: string) {
  if (this.authService.isAuthenticated('patient') || this.authService.isAuthenticated('doctor') || this.authService.isAuthenticated('admin')) {
    this.router.navigate(['/patients/doctor-profile/doctor-profile1', doctorId]);
  } else {
    // alert('Please log in to view doctor profiles.');
    this.router.navigate(['/authentication/login']);
  }
}

goToBooking(doctorId: string) {
  if (this.authService.isAuthenticated('patient') || this.authService.isAuthenticated('doctor') || this.authService.isAuthenticated('admin')) {
    this.router.navigate(['/pages/booking', doctorId]);
  } else {
    // alert('Please log in to book an appointment.');
    this.router.navigate(['/authentication/login']);
  }
}
getInitials(name: string | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
}
