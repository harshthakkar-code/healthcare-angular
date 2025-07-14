import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { routes } from 'src/app/shared/routes/routes';
import { ActivatedRoute } from '@angular/router';
import api from 'src/app/shared/api/axios';

interface Review {
  patient: {
    name: string;
    profileImgUrl?: string;
    // add other patient fields as needed
  };
  rating: number;
  createdAt: string;
  comment: string;
  // add other review fields as needed
}

@Component({
    selector: 'app-doctor-profile1',
    templateUrl: './doctor-profile1.component.html',
    styleUrl: './doctor-profile1.component.scss',
    standalone: false
})
export class DoctorProfile1Component implements OnInit {
  public routes = routes
  public ourDoctorOption: OwlOptions = {
    loop: true,
			margin: 24,
			dots: false,
			nav: true,
			smartSpeed: 2000,			
			navText: ['<i class="fa-solid fa-chevron-left "></i>', '<i class="fa-solid fa-chevron-right"></i>'],
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 1,
      },
      1000: {
        items: 6,
      },
      1300: {
        items: 1,
      },
    },
  };
  public availabilyOption: OwlOptions = {
    loop: false,
			margin: 24,
			dots: false,
			nav: true,
			smartSpeed: 2000,		
			navText: ['<i class="fa-solid fa-chevron-left "></i>', '<i class="fa-solid fa-chevron-right"></i>'],
      responsive: {
				0: {
					items: 2
				},
				768: {
					items: 3
				},
				1000: {
					items: 5
				},
				1300: {
					items: 6
				},
				1400: {
					items: 7
				}
			}
  };
  public awardOption: OwlOptions = {
    loop: false,
    margin: 24,
    dots: false,
    nav: true,
    smartSpeed: 2000,	
    
			navText: ['<i class="fa-solid fa-chevron-left "></i>', '<i class="fa-solid fa-chevron-right"></i>'],
      responsive: {
				0: {
					items: 1
				},
				768: {
					items: 1
				},
				1000: {
					items: 4
				},
				1300: {
					items: 4
				},
				1400: {
					items: 4
				}
			}
  };
  activeTab: string = 'doc_bio';
  public profile: any = null;
  public settings: any = null;
  public specializations: any = [];
  doctor: any = null;
  doctorSettings: any = null;
  public reviews: Review[] = [];
  favourites: any = null;
  payouts: any = null;
  reports: any = null;
  services: any = null;
  slots: any = null;
  socialMedia: any = null;
  public currentReviewPage: number = 1;
  public Math = Math;
  public appointmentCount: number | null = null;
  public totalYearsInPractice: number | null = null;
  public priceRange: string | null = null;
  userRole: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userRole = user.role || null;
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        api.get(`/doctor/public/full/${id}`).then((res: any) => {
          this.profile = res.data.profile;
          this.settings = res.data.settings;
          this.specializations = res.data.specializations;
          this.doctor = res.data.profile;
          this.doctorSettings = res.data.settings;
          this.reviews = res.data.reviews as Review[];
          this.favourites = res.data.favourites;
          this.payouts = res.data.payouts;
          this.reports = res.data.reports;
          this.services = res.data.services;
          this.slots = res.data.slots;
          this.socialMedia = res.data.socialMedia;
          this.fetchFavouriteStatus();
          this.appointmentCount = Array.isArray(res.data.appointments) ? res.data.appointments.length : 0;
          // Calculate total years in practice from settings.experienceSettings
          if (this.settings?.experienceSettings && Array.isArray(this.settings.experienceSettings)) {
            this.totalYearsInPractice = this.settings.experienceSettings.reduce((sum: number, exp: any) => {
              const year = parseFloat(exp.year);
              return sum + (isNaN(year) ? 0 : year);
            }, 0);
          } else {
            this.totalYearsInPractice = null;
          }
          // Calculate price range from specializations/services
          this.setPriceRange();
        });
      }
    });
  }

  setPriceRange() {
    let prices: number[] = [];
    if (Array.isArray(this.specializations)) {
      this.specializations.forEach((spec: any) => {
        if (Array.isArray(spec.services)) {
          spec.services.forEach((service: any) => {
            if (typeof service.price === 'number') {
              prices.push(service.price);
            }
          });
        }
      });
    }
    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      this.priceRange = min === max ? `$${min}` : `$${min} - $${max}`;
    } else {
      this.priceRange = null;
    }
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }
  scrollToSection(section: HTMLElement) {
    if (section) {
      this.scrollTo(section);
    }
  }

  scrollTo(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  public get filteredReviews(): any[] {
    return (this.reviews || []).filter(
      (review: Review) =>
        review &&
        review.patient &&
        typeof review.rating !== 'undefined' &&
        review.createdAt &&
        review.comment
    );
  }

  public timeAgo(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffDay === 0) {
      if (diffHr === 0) {
        if (diffMin === 0) return 'Just now';
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
      }
      return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    }
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  }

  get availabilityBadgeClass(): string {
    if (this.profile && this.profile.availability === true) {
      return 'bg-success-light';
    } else if (this.profile && this.profile.availability === false) {
      return 'bg-danger-light';
    }
    return 'bg-secondary';
  }
  get dotClass(): string {
    if (this.profile && this.profile.availability === true) {
      return 'dot-available';
    } else if (this.profile && this.profile.availability === false) {
      return 'dot-unavailable';
    }
    return 'dot-unknown';
  }

  get availabilityText(): string {
    if (this.profile && this.profile.availability === true) {
      return 'Available';
    } else if (this.profile && this.profile.availability === false) {
      return 'Unavailable';
    }
    return 'Unknown';
  }

  get profileImageUrl(): string {
    if (this.profile?.profileImage) {
      return this.profile.profileImage;
    } else if (this.profile?.profileImgUrl) {
      if (this.profile.profileImage.startsWith('http')) {
        return this.profile.profileImgUrl;
      } else {
        return 'assets/img/doctors/doc-profile-02.jpg';
      }
    } else {
      return 'assets/img/doctors/doc-profile-02.jpg';
    }
  }

  getPatientId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  async fetchFavouriteStatus() {
    const patientId = this.getPatientId();
    if (!patientId || !this.profile?._id) return;
    try {
      const favRes = await api.get(`/favourites?patientId=${patientId}&doctorId=${this.profile._id}`);
      this.profile.favourite = favRes.data.data && favRes.data.data.length > 0 ? favRes.data.data[0] : null;
    } catch {
      this.profile.favourite = null;
    }
  }

  async toggleFavourite() {
    const patientId = this.getPatientId();
    if (!patientId || !this.profile?._id) return;
    if (this.profile.favourite && this.profile.favourite.favourites) {
      // Remove from favourites
      try {
        await api.delete(`/favourites/${this.profile.favourite._id}`);
        this.profile.favourite = null;
      } catch {}
    } else {
      // Add to favourites
      try {
        const res = await api.post('/favourites', {
          patientId,
          doctorId: this.profile._id,
          favourites: true
        });
        this.profile.favourite = res.data;
      } catch {}
    }
  }
}
