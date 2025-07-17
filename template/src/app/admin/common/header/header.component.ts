import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { SidebarService } from 'src/app/shared/sidebar/sidebar.service';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent {
  public routes = routes;
  public miniSidebar = false;

  getDoctorImage(): string {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.profileImgUrl || 'assets/admin/img/profiles/avatar-01.jpg';
      } catch {
        return 'assets/admin/img/profiles/avatar-01.jpg';
      }
    }
    return 'assets/admin/img/profiles/avatar-01.jpg';
  }
  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/admin/img/profiles/avatar-01.jpg';
  }

  getUserName(): string {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.name || '';
      } catch {
        return '';
      }
    }
    return '';
  }

  constructor(public router: Router, private sidebar: SidebarService, private authService: AuthService) {
    this.sidebar.toggleSideBar.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
  }
  
  public miniSideBarMouseHover(position: string): void {
    if (position == 'over') {
      this.sidebar.expandSideBar.next(true);
    } else {
      this.sidebar.expandSideBar.next(false);
    }
  }
  public toggleAdminSideBar(): void {
    this.sidebar.switchAdminSideMenuPosition();
  }
  public toggleAdminMobileSideBar(): void {
    this.sidebar.switchAdminMobileSideBarPosition();
  }

   logout() {
    this.authService.logout();
    // this.user = null; // No longer needed, handled by observable
  }
}
