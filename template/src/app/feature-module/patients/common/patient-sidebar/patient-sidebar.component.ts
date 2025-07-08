import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/common/common.service';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-patient-sidebar',
    templateUrl: './patient-sidebar.component.html',
    styleUrl: './patient-sidebar.component.scss',
    standalone: false
})
export class PatientSidebarComponent implements OnInit {
  public routes = routes
  public base = '';
  public page = '';
  public last = '';

  patientProfile: any = null;

  constructor(private common: CommonService) {
    this.common.base.subscribe((base: string) => {
      this.base = base;
    });
    this.common.page.subscribe((page: string) => {
      this.page = page;
    });
    this.common.last.subscribe((last: string) => {
      this.last = last;
    });
  }

  ngOnInit(): void {
    this.getPatientProfile();
  }

  getPatientProfile() {
    api.get('/patient/profile').then((res: any) => {
      this.patientProfile = res.data;
    });
  }
}
