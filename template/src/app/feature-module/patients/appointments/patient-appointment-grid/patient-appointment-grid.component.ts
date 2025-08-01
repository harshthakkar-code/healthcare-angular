import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
  selector: 'app-patient-appointment-grid',
  templateUrl: './patient-appointment-grid.component.html',
  styleUrl: './patient-appointment-grid.component.scss',
  standalone: false
})
export class PatientAppointmentGridComponent implements OnInit {
  public routes = routes;
  public filter = false;
  bsValue = new Date();
  maxDate = new Date();

  // Dynamic data
  appointments: any[] = [];
  loading = true;
  error: string | null = null;

  // Search and filter
  private _searchTerm: string = '';
  patientId: string | null | undefined;
  attendErrorMessage: { [appointmentId: string]: string } = {};
  get searchTerm() { return this._searchTerm; }
  set searchTerm(val: string) { this._searchTerm = val; this.resetCurrentPage(); }

  private _bsRangeValue: Date[] = [];
  get bsRangeValue() { return this._bsRangeValue; }
  set bsRangeValue(val: Date[]) { this._bsRangeValue = val; this.resetCurrentPage(); }

  // Tabs
  selectedTab: 'upcoming' | 'cancelled' | 'completed' = 'upcoming';
  selectTab(tab: 'upcoming' | 'cancelled' | 'completed') {
    this.selectedTab = tab;
    if (tab === 'upcoming') this.upcomingCurrentPage = 1;
    if (tab === 'cancelled') this.cancelledCurrentPage = 1;
    if (tab === 'completed') this.completedCurrentPage = 1;
  }

  // Pagination
  pageSizeUpcoming = 9;
  pageSizeCancelled = 9;
  pageSizeCompleted = 9;
  upcomingCurrentPage = 1;
  upcomingTotalPages = 1;
  cancelledCurrentPage = 1;
  cancelledTotalPages = 1;
  completedCurrentPage = 1;
  completedTotalPages = 1;

  constructor() {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  ngOnInit(): void {
    this.fetchAppointments();
    this.patientId = this.fetchPatientId();
  }

  fetchPatientId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
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

  public showFilter() {
    this.filter = !this.filter;
  }

  resetCurrentPage() {
    if (this.selectedTab === 'upcoming') this.upcomingCurrentPage = 1;
    if (this.selectedTab === 'cancelled') this.cancelledCurrentPage = 1;
    if (this.selectedTab === 'completed') this.completedCurrentPage = 1;
  }

  get filteredAppointments() {
    return this.appointments.filter((apt: any) => {
      // Search filter
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
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
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

  // Pagination logic for each tab
  get paginatedUpcomingAppointments() {
    return this.upcomingAppointments.slice(0, this.pageSizeUpcoming);
  }
  get paginatedCancelledAppointments() {
    return this.cancelledAppointments.slice(0, this.pageSizeCancelled);
  }
  get paginatedCompletedAppointments() {
    return this.completedAppointments.slice(0, this.pageSizeCompleted);
  }

  // Pagination pages logic (with ellipsis)
  get paginationPagesUpcoming(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.upcomingTotalPages = Math.ceil(this.upcomingAppointments.length / this.pageSizeUpcoming) || 1;
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

  get paginationPagesCancelled(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.cancelledTotalPages = Math.ceil(this.cancelledAppointments.length / this.pageSizeCancelled) || 1;
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

  get paginationPagesCompleted(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.completedTotalPages = Math.ceil(this.completedAppointments.length / this.pageSizeCompleted) || 1;
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

  // Add loadMore method
  loadMore(tab: 'upcoming' | 'cancelled' | 'completed') {
    if (tab === 'upcoming') this.pageSizeUpcoming += 9;
    if (tab === 'cancelled') this.pageSizeCancelled += 9;
    if (tab === 'completed') this.pageSizeCompleted += 9;
  }
  canAttendAppointment(appointment: any): boolean {
  if (!appointment?.date || !appointment?.time) return false;

  const [startTimeStr, endTimeStr] = appointment.time.split(' - ');
  const date = new Date(appointment.date);

  // Parse start time
  const parseTime = (timeStr: string): Date => {
    const [hoursStr, minutesStrWithSuffix] = timeStr.trim().split(':');
    const isPM = minutesStrWithSuffix.toLowerCase().includes('pm');
    const minutesStr = minutesStrWithSuffix.toLowerCase().replace(/(am|pm)/g, '').trim();

    let hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    const fullDate = new Date(date);
    fullDate.setHours(hours, minutes, 0, 0);
    return fullDate;
  };

  const startTime = parseTime(startTimeStr);
  const endTime = parseTime(endTimeStr);

  // Calculate 5 minutes before start
  const accessStartTime = new Date(startTime);
  accessStartTime.setMinutes(accessStartTime.getMinutes() - 5);

  const now = new Date();

  return now >= accessStartTime && now <= endTime;
}
isAttendAllowed(appointment: any): boolean {
  if (!appointment?.date || !appointment?.time || !appointment.time.includes(' - ') ||     appointment.appointmentType !== 'video'
) return false;

  const [startTimeStr, endTimeStr] = appointment.time.split(' - ');
  const appointmentDate = new Date(appointment.date);

  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const [endHour, endMinute] = endTimeStr.split(':').map(Number);

  if (
    isNaN(startHour) || isNaN(startMinute) ||
    isNaN(endHour) || isNaN(endMinute)
  ) return false;

  const startTime = new Date(appointmentDate);
  startTime.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(appointmentDate);
  endTime.setHours(endHour, endMinute, 0, 0);

  const accessStart = new Date(startTime);
  accessStart.setMinutes(accessStart.getMinutes() - 5);

  const now = new Date();
  return now >= accessStart && now <= endTime;
}


handleAttendClick(apt: any) {
  const isAllowed = this.isAttendAllowed(apt);

  if (!isAllowed) {
    const [start, end] = apt.time?.split(' - ');
    this.attendErrorMessage[apt._id] = `You can only join from 5 minutes before (${start}) until the meeting ends at ${end}.`;
  } else {
    this.attendErrorMessage[apt._id] = '';
  }
}
}
