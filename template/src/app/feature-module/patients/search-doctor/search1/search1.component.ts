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
      const res = await api.get('/doctor/public', {
        params: {
          page: this.page,
          limit: this.pageSize,
          search: this.searchTerm,
          city: this.location,
          date: this.date
        }
      });
      const newDoctors = res.data.data || [];
      console.log(newDoctors)
      this.total = res.data.total || 0;
      // Fetch favourite status for each doctor using DoctorProfile._id
      const patientId = this.getPatientId();
      if (patientId) {
        await Promise.all(newDoctors.map(async (doc: any) => {
          try {
            // Use DoctorProfile._id for doctorId
            const favRes = await api.get(`/favourites?patientId=${patientId}&doctorId=${doc._id}`);
            doc.favourite = favRes.data.data && favRes.data.data.length > 0 ? favRes.data.data[0] : null;
          } catch {
            doc.favourite = null;
          }
        }));
      }
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
}
