import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-patient-appointments',
    templateUrl: './patient-appointments.component.html',
    styleUrl: './patient-appointments.component.scss',
    standalone: false
})
export class PatientAppointmentsComponent implements OnInit {
  public routes = routes;
  public filter = false;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();

  appointments: any[] = [];
  loading = true;
  error: string | null = null;

  pageSize = 5;
  upcomingPage = 1;
  cancelledPage = 1;
  completedPage = 1;

  // --- Upcoming Pagination ---
  upcomingCurrentPage = 1;
  upcomingTotalPages = 1;

  searchTerm: string = '';

  constructor() {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  ngOnInit(): void {
    this.fetchAppointments();
  }

  fetchAppointments(): void {
    this.loading = true;
    api.get('/patient/appointments')
      .then(res => {
        this.appointments = Array.isArray(res.data.appointments) ? res.data.appointments : [];
        this.loading = false;
      })
      .catch(() => {
        this.error = 'Failed to load appointments';
        this.loading = false;
      });
  }

  public showFilter(){
    this.filter = !this.filter
  }

  get filteredAppointments() {
    return this.appointments.filter((apt: any) => {
      // Search filter (by doctorName, specialty, appointmentType, email, phone)
      const search = this.searchTerm?.toLowerCase() || '';
      const searchMatch = search
        ? (
            (apt.doctorName && apt.doctorName.toLowerCase().includes(search)) ||
            (apt.specialty && apt.specialty.toLowerCase().includes(search)) ||
            (apt.appointmentType && apt.appointmentType.toLowerCase().includes(search)) ||
            (apt.email && apt.email.toLowerCase().includes(search)) ||
            (apt.phone && apt.phone.toLowerCase().includes(search))
          )
        : true;

      // Date filter
      let dateMatch = true;
      if (this.bsRangeValue && this.bsRangeValue.length === 2 && this.bsRangeValue[0] && this.bsRangeValue[1]) {
        const aptDate = new Date(apt.date);
        const from = new Date(this.bsRangeValue[0]);
        const to = new Date(this.bsRangeValue[1]);
        // Set time to cover the whole day
        from.setHours(0,0,0,0);
        to.setHours(23,59,59,999);
        dateMatch = aptDate >= from && aptDate <= to;
      }
      return searchMatch && dateMatch;
    });
  }

  get upcomingAppointments() {
    return this.filteredAppointments.filter((a: any) => a.status === 'accepted');
  }
  get cancelledAppointments() {
    return this.filteredAppointments.filter((a: any) => a.status === 'rejected');
  }
  get completedAppointments() {
    return this.filteredAppointments.filter((a: any) => a.status === 'completed');
  }

  get paginatedUpcomingAppointments() {
    const start = (this.upcomingCurrentPage - 1) * this.pageSize;
    return this.upcomingAppointments.slice(start, start + this.pageSize);
  }
  get paginationPagesUpcoming(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.upcomingTotalPages = Math.ceil(this.upcomingAppointments.length / this.pageSize) || 1;
    const current = this.upcomingCurrentPage;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  }
  goToPageUpcoming(page: number) {
    if (page < 1 || page > this.upcomingTotalPages || page === this.upcomingCurrentPage) return;
    this.upcomingCurrentPage = page;
  }
  prevPageUpcoming() {
    if (this.upcomingCurrentPage > 1) {
      this.goToPageUpcoming(this.upcomingCurrentPage - 1);
    }
  }
  nextPageUpcoming() {
    if (this.upcomingCurrentPage < this.upcomingTotalPages) {
      this.goToPageUpcoming(this.upcomingCurrentPage + 1);
    }
  }
  onPageClickUpcoming(page: number | string) {
    if (typeof page === 'number' && page !== this.upcomingCurrentPage) {
      this.goToPageUpcoming(page);
    }
  }

  // --- Cancelled Pagination ---
  cancelledCurrentPage = 1;
  cancelledTotalPages = 1;
  get paginatedCancelledAppointments() {
    const start = (this.cancelledCurrentPage - 1) * this.pageSize;
    return this.cancelledAppointments.slice(start, start + this.pageSize);
  }
  get paginationPagesCancelled(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.cancelledTotalPages = Math.ceil(this.cancelledAppointments.length / this.pageSize) || 1;
    const current = this.cancelledCurrentPage;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  }
  goToPageCancelled(page: number) {
    if (page < 1 || page > this.cancelledTotalPages || page === this.cancelledCurrentPage) return;
    this.cancelledCurrentPage = page;
  }
  prevPageCancelled() {
    if (this.cancelledCurrentPage > 1) {
      this.goToPageCancelled(this.cancelledCurrentPage - 1);
    }
  }
  nextPageCancelled() {
    if (this.cancelledCurrentPage < this.cancelledTotalPages) {
      this.goToPageCancelled(this.cancelledCurrentPage + 1);
    }
  }
  onPageClickCancelled(page: number | string) {
    if (typeof page === 'number' && page !== this.cancelledCurrentPage) {
      this.goToPageCancelled(page);
    }
  }

  // --- Completed Pagination ---
  completedCurrentPage = 1;
  completedTotalPages = 1;
  get paginatedCompletedAppointments() {
    const start = (this.completedCurrentPage - 1) * this.pageSize;
    return this.completedAppointments.slice(start, start + this.pageSize);
  }
  get paginationPagesCompleted(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.completedTotalPages = Math.ceil(this.completedAppointments.length / this.pageSize) || 1;
    const current = this.completedCurrentPage;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  }
  goToPageCompleted(page: number) {
    if (page < 1 || page > this.completedTotalPages || page === this.completedCurrentPage) return;
    this.completedCurrentPage = page;
  }
  prevPageCompleted() {
    if (this.completedCurrentPage > 1) {
      this.goToPageCompleted(this.completedCurrentPage - 1);
    }
  }
  nextPageCompleted() {
    if (this.completedCurrentPage < this.completedTotalPages) {
      this.goToPageCompleted(this.completedCurrentPage + 1);
    }
  }
  onPageClickCompleted(page: number | string) {
    if (typeof page === 'number' && page !== this.completedCurrentPage) {
      this.goToPageCompleted(page);
    }
  }

  getPages(total: number): number[] {
    return Array.from({ length: Math.ceil(total / this.pageSize) }, (_, i) => i + 1);
  }

  max(a: number, b: number): number {
    return Math.max(a, b);
  }
  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
