import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/common/common.service';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { Router } from '@angular/router';

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

  constructor(private common: CommonService, private authService: AuthService, private router: Router) {
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

  // Add logout method
  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
  getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

}
