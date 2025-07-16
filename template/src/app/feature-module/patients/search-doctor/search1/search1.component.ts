import { Component, OnInit } from '@angular/core';
import lgZoom from 'lightgallery/plugins/zoom';
import { BeforeSlideDetail } from 'lightgallery/lg-events';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
import { debounceTime, Subject } from 'rxjs';
import { DoctorSearchFilters } from '../../common/breadcrumb-search/breadcrumb-search.component';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
    selector: 'app-search1',
    templateUrl: './search1.component.html',
    styleUrls: ['./search1.component.scss'],
    standalone: false
})
export class Search1Component implements OnInit{
  public routes = routes;
  isfilter=false;
  location: string = '';
  date: string = '';
  settings = {
    counter: false,
    plugins: [lgZoom],
  };
  doctors: any[] = [];
  loading = false;
  error: string | null = null;
  // Pagination and search
  searchTerm: string = '';
  page: number = 1;
  pageSize: number = 12;
  total: number = 0;
  private searchSubject = new Subject<void>();
  availabilityFilter: boolean | null = null;
  userRole: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  onBeforeSlide = (detail: BeforeSlideDetail): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { index, prevIndex } = detail;
  };
  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userRole = user.role || null;
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm = params['q'];
        this.page = 1;
        this.doctors = [];
        this.fetchDoctors();
      }
    });
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.page = 1;
      this.doctors = [];
      this.fetchDoctors();
    });
    if (!this.searchTerm) {
      this.fetchDoctors();
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

  async fetchDoctors() {
    this.loading = true;
    try {
      const params: any = {
        page: this.page,
        limit: this.pageSize,
        search: this.searchTerm,
        city: this.location,
        date: this.date
      };
      if (this.availabilityFilter !== null) {
        params.availability = this.availabilityFilter;
      }
      const res = await api.get('/doctor/public', { params });
      const newDoctors = res.data.data || [];
      this.total = res.data.total || 0;
      // Optimized: Fetch favourite status for all doctors in one call
      const patientId = this.getPatientId();
      if (patientId && newDoctors.length > 0) {
        const doctorIds = newDoctors.map((doc: any) => doc._id);
        try {
          const favRes = await api.post('/favourites/status', { patientId, doctorIds });
          const batchStatus = favRes.data;
          newDoctors.forEach((doc: any) => {
            doc.favourite = batchStatus[doc._id] || null;
          });
        } catch {
          newDoctors.forEach((doc: any) => {
            doc.favourite = null;
          });
        }
      }
      // Enhance doctor data for dynamic display
      newDoctors.forEach((doc: any) => {
        // Avatar
        if (doc.profileImage) {
          if (doc.profileImage.startsWith('http')) {
            doc.avatar = doc.profileImage;
          } else {
            doc.avatar = 'assets/img/doctor-grid/doctor-grid-01.jpg';
          }
        } else {
          doc.avatar = 'assets/img/doctor-grid/doctor-grid-01.jpg';
        }
        // Max service price (flatten 2D services array if needed)
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
        doc.maxServicePrice = prices.length > 0 ? Math.max(...prices) : null;
        console.log( doc.maxServicePrice)
        // Speciality text
        if (Array.isArray(doc.specializations) && doc.specializations.length > 0) {
          doc.specialityText = doc.specializations.join(', ');
        } else if (doc.specialization && doc.specialization.name) {
          doc.specialityText = doc.specialization.name;
        } else {
          doc.specialityText = 'Specialist';
        }
        // Rating text
        if (typeof doc.avgRating === 'number') {
          doc.ratingText = doc.avgRating.toFixed(1);
        } else {
          doc.ratingText = 'N/A';
        }
        // Availability (boolean only)
        if (doc.availability === true || doc.availability == "true") {
          doc.statusText = 'Available';
          doc.statusClass = 'bg-success-light';
        } else {
          doc.statusText = 'Unavailable';
          doc.statusClass = 'bg-danger-light';
        }
      });
      if (this.page === 1) {
        this.doctors = newDoctors;
      } else {
        this.doctors = [...this.doctors, ...newDoctors];
      }
      this.loading = false;
    } catch {
      this.error = 'Failed to load doctors.';
      this.loading = false;
    }
  }

  async toggleFavourite(doctor: any) {
    const patientId = this.getPatientId();
    if (!patientId) return;
    console.log(doctor.favourite)
    if (doctor.favourite && doctor.favourite.favourites) {
      // Remove from favourites
      try {
        await api.delete(`/favourites/${doctor.favourite._id}`);
        doctor.favourite = null;
      } catch {}
    } else {
      // Add to favourites using DoctorProfile._id
      try {
        const res = await api.post('/favourites', {
          patientId,
          doctorId: doctor._id, // DoctorProfile._id
          favourites: true
        });
        doctor.favourite = res.data;
      } catch {}
    }
  }

  onSearch(filters: DoctorSearchFilters) {
    this.searchTerm = filters.name;
    this.location = filters.location;
    this.date = filters.date;
    this.page = 1;
    this.doctors = [];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchTerm },
      queryParamsHandling: 'merge',
    });
    this.searchSubject.next();
  }

  loadMore() {
    if (this.doctors.length < this.total && !this.loading) {
      this.page++;
      this.fetchDoctors();
    }
  }

  onDateChange(newDate: Date) {
    console.log(newDate);
  }
  filterOpen():void{
    this.isfilter=!this.isfilter;
  }

  onAvailabilityToggle(event: any) {
    this.availabilityFilter = event.target.checked ? true : null;
    this.page = 1;
    this.doctors = [];
    this.fetchDoctors();
  }

  getDoctorImage(doctor: any): string {
    return doctor.profileImgUrl || doctor.profileSettings?.profileImgUrl || doctor.profileImage || '';
  }
  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/img/doctor-grid/doctor-grid-01.jpg';
  }
}
