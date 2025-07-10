import { Component, OnInit } from '@angular/core';
import { BeforeSlideDetail } from 'lightgallery/lg-events';
import lgZoom from 'lightgallery/plugins/zoom';
import { routes } from 'src/app/shared/routes/routes';
import { ActivatedRoute } from '@angular/router';
import api from 'src/app/shared/api/axios';

interface Review {
  patient: {
    name: string;
    profileImgUrl?: string;
  };
  rating: number;
  createdAt: string;
  comment: string;
}

@Component({
    selector: 'app-doctor-profile2',
    templateUrl: './doctor-profile2.component.html',
    styleUrl: './doctor-profile2.component.scss',
    standalone: false
})
export class DoctorProfile2Component implements OnInit {
  public routes = routes;
  public profile: any = null;
  public gallerySettings = {
    counter: false,
    plugins: [lgZoom],
  };
  public specializations: any = [];
  public reviews: any[] = [];
  public appointments: any[] = [];
  public favourites: any = null;
  public totalYearsInPractice: number | null = null;
  public appointmentCount: number | null = null;
  public services: any[] = [];
  public settings: any = null;
  public currentReviewPage: number = 1;
  public Math = Math;
  public newReview = { rating: null, comment: '' };
  public reviewLoading = false;
  public reviewError: string | null = null;
  public reviewSuccess = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        api.get(`/doctor/public/full/${id}`).then((res: any) => {
          this.profile = res.data.profile;
          this.settings = res.data.settings;
          this.specializations = res.data.specializations;
          this.reviews = res.data.reviews as any[];
          this.favourites = res.data.favourites;
          this.appointments = res.data.appointments || [];
          this.services = res.data.services || [];
          this.appointmentCount = this.appointments.length;
          // Calculate total years in practice from settings.experienceSettings
          if (this.settings?.experienceSettings && Array.isArray(this.settings.experienceSettings)) {
            this.totalYearsInPractice = this.settings.experienceSettings.reduce((sum: number, exp: any) => {
              const year = parseFloat(exp.year);
              return sum + (isNaN(year) ? 0 : year);
            }, 0);
          } else {
            this.totalYearsInPractice = null;
          }
        });
      }
    });
  }

  onBeforeSlide = (detail: BeforeSlideDetail): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { index, prevIndex } = detail;
  };

  async toggleFavourite() {
    const patientId = this.getPatientId();
    if (!patientId || !this.profile?._id) return;
    if (this.profile.favourite && this.profile.favourite.favourites) {
      try {
        await api.delete(`/favourites/${this.profile.favourite._id}`);
        this.profile.favourite = null;
      } catch {}
    } else {
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

  getPatientId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  get paginatedReviews(): any[] {
    const start = (this.currentReviewPage - 1) * 5;
    const end = this.currentReviewPage * 5;
    return (this.reviews || []).slice(start, end);
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

  async submitReview() {
    if (!this.newReview.rating || !this.newReview.comment || !this.profile?._id) return;
    this.reviewLoading = true;
    this.reviewError = null;
    this.reviewSuccess = false;
    try {
      const res = await api.post('/reviews', {
        doctorId: this.profile._id,
        rating: this.newReview.rating,
        comment: this.newReview.comment
      });
      // Add the new review to the top of the list
      this.reviews = [res.data, ...this.reviews];
      this.newReview = { rating: null, comment: '' };
      this.reviewSuccess = true;
    } catch (err: any) {
      this.reviewError = err?.response?.data?.message || 'Failed to submit review.';
    } finally {
      this.reviewLoading = false;
    }
  }
}
