import { Component, OnInit } from '@angular/core';
import api from 'src/app/shared/api/axios';
import { routes } from 'src/app/shared/routes/routes';

@Component({
    selector: 'app-favourites',
    templateUrl: './favourites.component.html',
    styleUrls: ['./favourites.component.scss'],
    standalone: false
})
export class FavouritesComponent implements OnInit {
  public routes = routes;
  favourites: any[] = [];
  doctorProfiles: any[] = [];
  loading = true;
  error: string | null = null;
  page = 1;
  limit = 9;
  total = 0;
  loadingMore = false;
  search: string = '';

  ngOnInit(): void {
    this.fetchFavourites();
  }

  getPatientId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  fetchFavourites(loadMore = false): void {
    if (!loadMore) {
      this.page = 1;
      this.doctorProfiles = [];
    }
    this.loading = !loadMore;
    this.loadingMore = loadMore;
    const patientId = this.getPatientId();
    if (!patientId) {
      this.error = 'Error: Patient ID not found. Please log in again.';
      this.loading = false;
      this.loadingMore = false;
      return;
    }
    api.get(`/favourites?patientId=${patientId}&favourites=true&page=${this.page}&limit=${this.limit}&search=${encodeURIComponent(this.search)}`)
      .then(res => {
        this.favourites = res.data.data || res.data || [];
        this.total = res.data.total || this.favourites.length;
        // Fetch doctor profiles for each favourite
        return Promise.all(this.favourites.map(fav =>
          api.get(`/doctor/by-user/${fav.doctorId._id}`).then(docRes => ({
            doctor: docRes.data,
            favourite: fav
          })).catch(() => null)
        ));
      })
      .then(results => {
        const newProfiles = (results || []).filter(d => d && d.doctor);
        // Fetch appointments for each doctor
        return Promise.all(newProfiles.map(async (profile) => {
          if (!profile) return profile;
          try {
            const appointments = await api.get(`/doctor/appointments/doctor/${profile.doctor.user}`);
            (profile as any).appointments = appointments.data || [];
          } catch {
            (profile as any).appointments = [];
          }
          return profile;
        }));
      })
      .then(finalProfiles => {
        if (loadMore) {
          this.doctorProfiles = this.doctorProfiles.concat(finalProfiles);
        } else {
          this.doctorProfiles = finalProfiles;
        }
        this.loading = false;
        this.loadingMore = false;
      })
      .catch(() => {
        this.loading = false;
        this.loadingMore = false;
        this.error = 'Failed to load favourites.';
      });
  }

  loadMore(): void {
    this.page++;
    this.fetchFavourites(true);
  }

  toggleFavourite(index: number) {
    const fav = this.doctorProfiles[index]?.favourite;
    if (!fav) return;
    const newStatus = !fav.favourites;
    api.put(`/favourites/${fav._id}`, { favourites: newStatus })
      .then(() => {
        fav.favourites = newStatus;
        if (!newStatus) {
          this.doctorProfiles.splice(index, 1);
        }
      })
      .catch(() => {
        this.error = 'Failed to update favourite.';
      });
  }

  get canLoadMore(): boolean {
    return this.doctorProfiles.length < this.total;
  }

  // Helper to get the latest appointment date for a doctor
  getLatestAppointmentDate(appointments: any[]): string {
    if (!appointments || appointments.length === 0) return 'N/A';
    // Sort by date descending
    const sorted = appointments.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0].date;
  }

  onSearchChange(): void {
    this.page = 1;
    this.fetchFavourites();
  }
}
