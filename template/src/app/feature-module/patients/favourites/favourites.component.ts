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
        this.favourites = (res.data.data || res.data || []).filter((fav: any) => fav.doctorId);
        this.total = res.data.total || this.favourites.length;
        console.log(res.data.data)
        // Fetch doctor profiles for each favourite using doctorId._id (DoctorProfile)
        return Promise.all(this.favourites.map(fav =>
          api.get(`/doctor/by-user/${fav.doctorId.user}`).then(docRes => ({
            doctor: docRes.data,
            favourite: fav
          })).catch(() => null)
        ));
      })
      .then(results => {
        const newProfiles = (results || []).filter(d => d && d.doctor);
        // Fetch all appointments once
        return api.get(`/patient/appointments`).then(appointmentsRes => {
          const allAppointments = appointmentsRes.data.appointments || [];
          // Assign only relevant appointments to each doctor
          return newProfiles.map(profile => {
            if (!profile) return profile;
            console.log(profile.doctor.user , allAppointments)
            const doctorAppointments = allAppointments.filter(
              (appt: any) => String(appt.doctor) === String(profile.doctor.user)
            );
            (profile as any).appointments = doctorAppointments;
            return profile;
          });
        });
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

  // Helper to get the latest appointment date and time for a doctor
  getLatestAppointmentForDoctor(doctorId: string, appointments: any[]): string {
    if (!appointments || appointments.length === 0) return 'N/A';

    // Filter appointments for this doctor
    const doctorAppointments = appointments.filter(
      appt => appt.doctor === doctorId
    );

    if (doctorAppointments.length === 0) return 'N/A';

    // Sort by combined date and time descending
    doctorAppointments.sort((a, b) => {
      const aDateTime = new Date(`${a.date} ${a.time}`);
      const bDateTime = new Date(`${b.date} ${b.time}`);
      return bDateTime.getTime() - aDateTime.getTime();
    });

    const latest = doctorAppointments[0];
    // Format as needed, e.g., "2025-06-25 02:00 PM"
    return `${latest.date} ${latest.time}`;
  }

  onSearchChange(): void {
    this.page = 1;
    this.fetchFavourites();
  }
}
