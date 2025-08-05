import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/common/common.service';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
import { AuthService } from 'src/app/shared/auth/auth.service';
@Component({
    selector: 'app-doctor-sidebar',
    templateUrl: './doctor-sidebar.component.html',
    styleUrl: './doctor-sidebar.component.scss',
    standalone: false
})
export class DoctorSidebarComponent implements OnInit {
  public routes = routes;
  public base = '';
  public page = '';
  public last = '';
  doctorProfile: any = null;
  pendingRequestCount: number = 0;
  doctorSettings: any = null;
  educationDetails: any[] = [];
  availability: boolean = false;
  specializations: any[] = [];
  doctorid: string | null | undefined;

  constructor(private common: CommonService, private router: Router, private authService: AuthService) {
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.last.subscribe((res: string) => {
      this.last = res;
    });
    console.log('base', this.base);
    console.log('page', this.page);
    console.log('last', this.last);
    this.getDoctorProfile();
    this.getPendingRequestCount();
  }
ngOnInit(): void {
  console.log('DoctorSidebarComponent ngOnInit called');
  this.getDoctorProfile();
  this.getPendingRequestCount();
  this.getDoctorSettings();
  this.getSpecializations();
}
getDoctorProfile() {
  api.get('/doctor/profile').then((res: any) => {
    console.log('Doctor profile received:', res);
    this.doctorProfile = res.data;
    this.availability = res.data.availability === true;
  });
}

getDoctorId(): string | null {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
          return user.id || user._id || null;

  } catch {
    return null;
  }
}

getPendingRequestCount() {
  const doctorId = this.getDoctorId();
  if (!doctorId) return;
  api.get(`/doctor/appointments/doctor/${doctorId}`)
    .then(res => {
      const pending = (res.data || []).filter((a: any) => a.status === 'pending');
      this.pendingRequestCount = pending.length;
    });
}

getDoctorSettings() {
  const doctorId = this.getDoctorId();
  this.doctorid = doctorId ;
  if (!doctorId) return;
  api.get(`/doctor-Settings/${doctorId}`).then((res: any) => {
    this.doctorSettings = res.data;
    this.educationDetails = res.data.educationSettings || [];
  }).catch(() => {
    this.doctorSettings = null;
    this.educationDetails = [];
  });
}

onAvailabilityChange(newValue: boolean) {
  this.availability = newValue;
  api.put('/doctor/profile', { availability: newValue })
    .then((res: any) => {
      this.doctorProfile = res.data;
    });
}

getSpecializations() {
  const doctorId = this.getDoctorId();
  if (!doctorId) return;
  api.get(`/specialization?doctorId=${doctorId}`).then((res: any) => {
    this.specializations = res.data || [];
  });
}

// getSpecializationImage(name: string): string {
//   const images: { [key: string]: string } = {
//     'Cardiology': 'assets/img/specializations/cardiology.png',
//     // Add more mappings as needed
//   };
//   return images[name] || 'assets/img/specializations/default.png';
// }

getSpecializationRows(): any[][] {
  const rows: any[][] = [];
  const count = this.specializations.length;
  if (count === 1) {
    rows.push([this.specializations[0]]);
  } else if (count === 2) {
    rows.push([this.specializations[0], this.specializations[1]]);
  } else if (count === 3) {
    rows.push([this.specializations[0]]);
    rows.push([this.specializations[1], this.specializations[2]]);
  } else if (count > 3) {
    rows.push([this.specializations[0]]);
    rows.push([this.specializations[1], this.specializations[2]]);
    rows.push(this.specializations.slice(3));
  }
  return rows;
}

  // Add logout method
  logout() {
    this.authService.logout();
    this.router.navigate([this.routes.userLogin]);
  }

  get availabilityText(): string {
    return this.availability ? 'Available' : 'Unavailable';
  }

  get pendingRequestDisplay(): string {
    return this.pendingRequestCount > 9 ? '9+' : this.pendingRequestCount.toString();
  }
  getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

}

