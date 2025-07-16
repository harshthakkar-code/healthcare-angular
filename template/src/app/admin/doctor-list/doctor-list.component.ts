import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { DataService } from 'src/app/shared/data/data.service';
import { doctorList, pageSelection, apiResultFormat } from 'src/app/shared/models/models';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-doctor-list',
    templateUrl: './doctor-list.component.html',
    styleUrls: ['./doctor-list.component.scss'],
    standalone: false
})
export class DoctorListComponent {
  public routes = routes;
  public tableData: Array<doctorList> = [];
  initChecked = false;
  isLoading = false;
  
  // pagination variables
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<doctorList>;
  public searchDataValue = '';
  // pagination variables end
  statusFilter: string = '';

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.doctorList) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });
  }

  private getTableData(pageOption: pageSelection): void {
    this.data.getDoctorList().subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: doctorList, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.id = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<doctorList>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
        tableData2: [],
        tableData3: [],
        tableData4: []
      });
    });
  }

  public sortData(sort: Sort) {
    const data = this.tableData.slice();

    if (!sort.active || sort.direction === '') {
      this.tableData = data;
    } else {
      this.tableData = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }
  selectAll(initChecked: boolean) {
    if (!initChecked) {
      this.tableData.forEach((f) => {
        f.isSelected = true;
      });
    } else {
      this.tableData.forEach((f) => {
        f.isSelected = false;
      });
    }
  }
  onStatusToggle(data: doctorList, index: number) {
    console.log('Doctor row data:', data);
    const userId = (data as any).userId;
    console.log('userId:', userId);
    if (!userId) {
      alert('User ID is missing for this doctor. Cannot update status.');
      return;
    }
    const newStatus = data.isStatus ? 'true' : 'false';
    this.data.updateDoctorStatus(userId, newStatus).subscribe({
      next: (res) => {
        // Optionally show a success message
      },
      error: (err) => {
        // Optionally revert the toggle or show an error
        data.isStatus = !data.isStatus;
      }
    });
  }

  approveDoctor(doctor: any) {
    // if (!window.confirm('Are you sure you want to approve this doctor?')) return;
    this.isLoading = true;
    api.put(`/doctor/admin/${doctor.userId}/approve`, { isApproved: 'true' })
      .then(() => {
        this.data.triggerDoctorListRefresh();
        this.fetchDoctors();
        this.isLoading = false;
      })
      .catch(() => this.isLoading = false);
  }

  rejectDoctor(doctor: any) {
    // if (!window.confirm('Are you sure you want to reject this doctor?')) return;
    this.isLoading = true;
    api.put(`/doctor/admin/${doctor.userId}/approve`, { isApproved: 'false' })
      .then(() => {
        this.data.triggerDoctorListRefresh();
        this.fetchDoctors();
        this.isLoading = false;
      })
      .catch(() => this.isLoading = false);
  }

  fetchDoctors() {
    this.isLoading = true;
    this.data.getDoctorList(this.statusFilter).subscribe({
      next: (apiRes) => {
        this.tableData = apiRes.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  onStatusFilterChange() {
    this.fetchDoctors();
  }

  getDoctorImage(data: any): string {
    return data.img ;
  }
  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/admin/img/profiles/avatar-01.jpg';
  }
}

