import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/common/common.service';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
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

  constructor(private common: CommonService, private router: Router) {
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
}
getDoctorProfile() {
  api.get('/doctor/profile').then((res: any) => {
    console.log('Doctor profile received:', res);
    this.doctorProfile = res.data;
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
}

