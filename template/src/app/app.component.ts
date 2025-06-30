import { Component, OnInit } from '@angular/core';
import { CommonService } from './shared/common/common.service';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  Event as RouterEvent,
} from '@angular/router';
import { DataService } from './shared/data/data.service';
import { SidebarService } from './shared/sidebar/sidebar.service';
import { routes } from 'src/app/shared/routes/routes';
import { url } from './shared/models/models';
import { TestService } from './shared/data/test.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  public routes = routes;
  title = 'template';
  base = '';
  page = '';
  last = '';
  public miniSidebar = false;
  public expandMenu = false;
  public mobileSidebar = false;
  public showMiniSidebar = false;
  backendMessage = '';

  constructor(
    private common: CommonService,
    private router: Router,
    private data: DataService,
    private sidebar: SidebarService,
    private testService: TestService
  ) {
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.last.subscribe((res: string) => {
      this.last = res;
    });
    this.router.events.subscribe((data: RouterEvent) => {
      // console.log('base',this.base);
      // console.log('page',this.page);
      // console.log('last',this.last);
      if (data instanceof NavigationStart) {
        this.getRoutes(data);
        this.mobileSidebar = false;
        localStorage.removeItem('isMobileSidebar');
        localStorage.removeItem('sidebarPosition');
      }
      if (data instanceof NavigationEnd) {
        this.showMiniSidebar = false;
      }
    });
    this.sidebar.toggleSideBar.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    this.sidebar.toggleMobileSideBar.subscribe((res: string) => {
      if (res == 'true' || res == 'true') {
        this.mobileSidebar = true;
      } else {
        this.mobileSidebar = false;
      }
    });
    this.sidebar.expandSideBar.subscribe((res) => {
      this.expandMenu = res;
      if (res == false && this.miniSidebar == true) {
        this.data.adminSidebar.map((mainMenus) => {
          mainMenus.menu.map((resMenu) => {
            resMenu.showSubRoute = false;
          });
        });
      }
      if (res == true && this.miniSidebar == true) {
        this.data.adminSidebar.map((mainMenus) => {
          mainMenus.menu.map((resMenu) => {
            const menuValue = sessionStorage.getItem('menuValue');
            if (menuValue && menuValue == resMenu.menuValue) {
              resMenu.showSubRoute = true;
            } else {
              resMenu.showSubRoute = false;
            }
          });
        });
      }
    });
    this.sidebar.toogleUserSidebar.subscribe((res: string) => {
      if (res == 'true') {
        this.showMiniSidebar = true;
      } else {
        this.showMiniSidebar = false;
      }
    });
  }

  ngOnInit() {
    // this.testBackendConnection();
  }

  async testBackendConnection() {
    try {
      const res = await this.testService.testConnection();
      this.backendMessage = res.message;
      console.log('Backend connection:', res);
    } catch (err) {
      this.backendMessage = 'Backend connection failed!';
      console.error('Backend connection failed:', err);
    }
  }

  public getRoutes(events: url) {
    const splitVal = events.url.split('/');
    this.common.base.next(splitVal[1]);
    this.common.page.next(splitVal[2]);
    this.common.last.next(splitVal[3]);
  }
}
