import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { DataService } from 'src/app/shared/data/data.service';
import { dependentList, apiResultFormat, pageSelection } from 'src/app/shared/models/models';
import { routes } from 'src/app/shared/routes/routes';
import { DependantService } from '../dependant.service';

@Component({
    selector: 'app-dependent-list',
    templateUrl: './dependent-list.component.html',
    styleUrls: ['./dependent-list.component.scss'],
    standalone: false
})
export class DependentListComponent implements OnInit {
  public routes = routes;
  public tableData: Array<dependentList> = [];
  public dependants: any[] = [];
  public userId = '';
  // pagination variables
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<dependentList>;
  public searchDataValue = '';
  // pagination variables end
  editDependant: any = {};

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private dependantService: DependantService
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.dependentList) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });
  }

  ngOnInit() {
    const id = this.getPatientId();
    if (id) {
      this.userId = id;
      this.fetchDependants();
      this.dependantService.dependantsChanged$.subscribe(() => {
        this.fetchDependants();
      });
    } else {
      this.dependants = [];
    }
  }

  getPatientId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  fetchDependants() {
    this.dependantService.getDependants(this.userId).subscribe({
      next: (res) => {
        console.log('Dependants response:', res);
        this.dependants = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => {
        this.dependants = [];
      }
    });
  }

  private getTableData(pageOption: pageSelection): void {
    this.data.getDependentList().subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: dependentList, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.id = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<dependentList>(this.tableData);
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

  onEditDependant(dep: any) {
    this.editDependant = { ...dep };
    const modal = document.getElementById('edit_dependent');
    if (modal) (window as any).bootstrap?.Modal.getOrCreateInstance(modal).show();
  }

  saveEditDependant() {
    this.dependantService.updateDependant(this.editDependant._id, this.editDependant).subscribe({
      next: () => {
        this.fetchDependants();
        const modal = document.getElementById('edit_dependent');
        if (modal) (window as any).bootstrap?.Modal.getOrCreateInstance(modal).hide();
      }
    });
  }

  onStatusToggle(dep: any) {
    const newStatus = dep.status === 'active' ? 'inactive' : 'active';
    this.dependantService.updateDependant(dep._id, { ...dep, status: newStatus }).subscribe({
      next: () => {
        dep.status = newStatus; // update UI immediately
      },
      error: () => {
        // Optionally show an error/toast
      }
    });
  }
}
