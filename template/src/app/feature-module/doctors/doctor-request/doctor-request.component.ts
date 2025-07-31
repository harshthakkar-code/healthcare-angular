import { Component, OnInit } from '@angular/core';
import api from 'src/app/shared/api/axios';
import { routes } from 'src/app/shared/routes/routes';

@Component({
    selector: 'app-doctor-request',
    templateUrl: './doctor-request.component.html',
    styleUrl: './doctor-request.component.scss',
    standalone: false
})
export class DoctorRequestComponent implements OnInit {
  public routes = routes;
  appointments: any[] = [];
  loading = true;
  statusLoading: { [id: string]: boolean } = {};
  statusError: { [id: string]: string } = {};
  doctorId: string | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.doctorId = this.getDoctorId();
    if (!this.doctorId) {
      this.error = 'Error: Doctor ID not found. Please log in again.';
      this.loading = false;
      return;
    }
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
    api.get(`/doctor/appointments/doctor/${this.doctorId}`)
      .then(res => {
        this.appointments = (res.data || []).filter((a: any) => a.status === 'pending');
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        this.error = 'Failed to load appointments.';
      });
  }

  handleStatus(id: string, status: string): void {
    this.statusLoading[id] = true;
    this.statusError[id] = '';
    api.put(`/doctor/appointments/${id}/status`, { status })
      .then(() => {
        this.appointments = this.appointments.filter(a => a._id !== id);
        this.statusLoading[id] = false;
      })
      .catch((err) => {
        this.statusLoading[id] = false;
        this.statusError[id] = err?.response?.data?.message || 'Failed to update appointment status.';
        setTimeout(() => {
          this.statusError[id] = '';
        }, 3000);
      });
  }
}
