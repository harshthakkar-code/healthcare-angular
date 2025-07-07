import { Component, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/shared/common/common.service';
import { routes } from 'src/app/shared/routes/routes';

export interface DoctorSearchFilters {
  name: string;
  location: string;
  date: string;
}

@Component({
  selector: 'app-breadcrumb-search',
  standalone:false,
  templateUrl: './breadcrumb-search.component.html',
  styleUrl: './breadcrumb-search.component.scss'
})
export class BreadcrumbSearchComponent {
  public routes = routes;
  base = '';
  page = '';
  last = '';
  searchValue: string = '';
  location: string = '';
  date: string = '';
  @Output() search = new EventEmitter<DoctorSearchFilters>();

  constructor(private common: CommonService) {
    this.common.base.subscribe((res: string) => {
      this.base = res?.replaceAll('-', ' ');
    });
    this.common.page.subscribe((res: string) => {
      if (res === 'chat') {
        this.page = 'Message';
      } else if (res === 'appointments') {
        this.page = 'Patient Appointments';
      } else if (res === 'patient-accounts') {
        this.page = 'Accounts';
      } else if (res === 'patient-invoice') {
        this.page = 'Invoices';
      } else {
        this.last = this.page;
        this.page = res?.replaceAll('-', ' ');
      }
    });
    this.common.last.subscribe((res: string) => {
      this.last = res?.replaceAll('-', ' ');
    });
  }

  onSubmit(): void {
    this.search.emit({
      name: this.searchValue,
      location: this.location,
      date: this.date
    });
  }
}
