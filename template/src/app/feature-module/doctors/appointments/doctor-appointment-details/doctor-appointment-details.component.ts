import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { ActivatedRoute } from '@angular/router';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-doctor-appointment-details',
    templateUrl: './doctor-appointment-details.component.html',
    styleUrl: './doctor-appointment-details.component.scss',
    standalone: false
})
export class DoctorAppointmentDetailsComponent implements OnInit {
  public routes = routes;
  appointment: any;
  recentAppointments: any[] = [];
  errorMessage: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      api.get(`/doctor/appointments/${id}`).then(res => {
        this.appointment = res.data;
        if (this.appointment?.doctor?._id || this.appointment?.doctor) {
          const doctorId = this.appointment.doctor._id || this.appointment.doctor;
          api.get(`/doctor/appointments/doctor/${doctorId}`).then(listRes => {
            this.recentAppointments = (listRes.data || []).filter((apt: any) => apt._id !== id);
          });
        }
      });
    }
  }

  async rejectAppointment() {
    if (!this.appointment?._id) return;
    try {
      const response = await api.put(`/doctor/appointments/${this.appointment._id}/status`, {
        status: 'rejected'
      });
      this.appointment = response.data;
      this.errorMessage = '';
    } catch (error: any) {
      this.errorMessage = error?.response?.data?.message || 'Failed to reject appointment';
    }
  }

  async acceptAppointment() {
    if (!this.appointment?._id) return;
    try {
      const response = await api.put(`/doctor/appointments/${this.appointment._id}/status`, {
        status: 'accepted'
      });
      this.appointment = response.data;
      this.errorMessage = '';
    } catch (error: any) {
      this.errorMessage = error?.response?.data?.message || 'Failed to accept appointment';
    }
  }
}
