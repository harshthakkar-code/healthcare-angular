import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-appointment-list',
    templateUrl: './appointment-list.component.html',
    styleUrl: './appointment-list.component.scss',
    standalone: false
})
export class AppointmentListComponent implements OnInit {
  public routes = routes;
  public filter = false;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  searchTerm: string = '';

  allAppointments: any[] = [];
  loading = true;
  error: string | null = null;
  selectedTab: 'upcoming' | 'cancelled' | 'completed' = 'upcoming';
  attendErrorMessage: { [key: string]: string } = {};
  doctorId: string | null | undefined;


  constructor() {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  ngOnInit(): void {
    this.fetchAppointments();
  }

  getDoctorId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  fetchAppointments(): void {
    this.loading = true;
    const doctorId = this.getDoctorId();
    this.doctorId = doctorId;
    if (!doctorId) {
      this.error = 'Doctor ID not found';
      this.loading = false;
      return;
    }
    api.get(`/doctor/appointments/doctor/${doctorId}`)
      .then(res => {
        this.allAppointments = Array.isArray(res.data) ? res.data : [res.data];
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        this.error = 'Failed to load appointments.';
      });
  }

 get upcomingAppointments() {
  return this.allAppointments.filter(a => {
    const statusMatch = a.status === 'accepted';
    const nameMatch = this.searchTerm
      ? (a.patient?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         a.patient?.email?.toLowerCase().includes(this.searchTerm.toLowerCase()))
      : true;

    let dateMatch = true;
    if (this.bsRangeValue && this.bsRangeValue.length === 2 && this.bsRangeValue[0] && this.bsRangeValue[1]) {
      const aptDate = new Date(a.date);
      const from = new Date(this.bsRangeValue[0]);
      const to = new Date(this.bsRangeValue[1]);

      // Normalize time to cover full day
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      dateMatch = aptDate >= from && aptDate <= to;
    }

    return statusMatch && nameMatch && dateMatch;
  });
}

  get cancelledAppointments() {
    return this.allAppointments.filter(a => {
      const statusMatch = a.status === 'cancelled' || a.status === 'rejected';
      const nameMatch = this.searchTerm ? (a.patient?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || a.patient?.email?.toLowerCase().includes(this.searchTerm.toLowerCase())) : true;
      const dateMatch = this.bsRangeValue && this.bsRangeValue.length === 2 ?
        (new Date(a.date) >= new Date(this.bsRangeValue[0]) && new Date(a.date) <= new Date(this.bsRangeValue[1])) : true;
      return statusMatch && nameMatch && dateMatch;
    });
  }
  get completedAppointments() {
    return this.allAppointments.filter(a => {
      const statusMatch = a.status === 'completed';
      const nameMatch = this.searchTerm ? (a.patient?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || a.patient?.email?.toLowerCase().includes(this.searchTerm.toLowerCase())) : true;
      const dateMatch = this.bsRangeValue && this.bsRangeValue.length === 2 ?
        (new Date(a.date) >= new Date(this.bsRangeValue[0]) && new Date(a.date) <= new Date(this.bsRangeValue[1])) : true;
      return statusMatch && nameMatch && dateMatch;
    });
  }

  public showFilter() {
    this.filter = !this.filter;
  }

  selectTab(tab: 'upcoming' | 'cancelled' | 'completed') {
    this.selectedTab = tab;
  }

isAttendAllowed(appointment: any): boolean {
  if (!appointment?.date || !appointment?.time || !appointment.time.includes(' - ') ||  appointment.appointmentType !== 'video') return false;

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
