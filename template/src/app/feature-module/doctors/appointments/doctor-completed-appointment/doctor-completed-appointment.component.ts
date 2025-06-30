import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import api from 'src/app/shared/api/axios';
import { routes } from 'src/app/shared/routes/routes';

@Component({
    selector: 'app-doctor-completed-appointment',
    templateUrl: './doctor-completed-appointment.component.html',
    styleUrl: './doctor-completed-appointment.component.scss',
    standalone: false
})
export class DoctorCompletedAppointmentComponent implements OnInit {
  public routes = routes
  appointment: any = null;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      api.get(`/doctor/appointments/${id}`)
        .then(res => {
          this.appointment = res.data;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.error = 'Failed to load appointment details.';
        });
    } else {
      this.loading = false;
      this.error = 'No appointment ID provided.';
    }
  }
}
