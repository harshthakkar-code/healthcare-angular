import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { ActivatedRoute } from '@angular/router';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-patient-appoinment-details',
    templateUrl: './patient-appoinment-details.component.html',
    styleUrl: './patient-appoinment-details.component.scss',
    standalone: false
})
export class PatientAppoinmentDetailsComponent implements OnInit {
  public routes = routes;
  appointment: any;
  loading = true;
  error = '';
  doctorProfile: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      api.get(`/patient/appointments?id=${id}`)
        .then(res => {
          const found = (res.data.appointments || []).find((apt: any) => apt._id === id);
          this.appointment = found || null;
          this.loading = false;
          // Fetch doctor profile if doctor id is present
          if (this.appointment?.doctor?._id) {
            api.get(`/doctor/public/contact/${this.appointment.doctor._id}`)
              .then(docRes => {
                this.doctorProfile = docRes.data;
              })
              .catch(() => {
                this.doctorProfile = null;
              });
          }
        })
        .catch(err => {
          this.error = 'Failed to load appointment details';
          this.loading = false;
        });
    }
  }
}
