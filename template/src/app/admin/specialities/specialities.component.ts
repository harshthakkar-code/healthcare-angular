import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { DataService } from 'src/app/shared/data/data.service';
import { pageSelection, apiResultFormat, specialities } from 'src/app/shared/models/models';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-specialities',
    templateUrl: './specialities.component.html',
    styleUrls: ['./specialities.component.scss'],
    standalone: false
})
export class SpecialitiesComponent implements OnInit {
  public routes = routes;
  public tableData: Array<specialities> = [];

  // pagination variables
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<specialities>;
  public searchDataValue = '';
  // pagination variables end

  specialityOptions: any[] = [];
  loadingOptions = false;
  errorOptions = '';
  newSpecialityName: string = '';
  editSpecialityId: string | null = null;
  editSpecialityName: string = '';
  deleteSpecialityId: string | null = null;
  newSpecialityImage: string = '';
  editSpecialityImage: string = '';

  specialityImageMap: { [key: string]: string } = {
    'Urology': 'assets/img/specialities/speciality-01.svg',
    'Neurology': 'assets/img/specialities/speciality-02.svg',
    'Orthopedic': 'assets/img/specialities/speciality-03.svg',
    'Cardiologist': 'assets/img/specialities/speciality-04.svg',
    'Dentist': 'assets/img/specialities/speciality-05.svg',
    // Add more as needed
  };

  private _deleteListener: any;
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.specialities) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });
  }

  ngOnInit(): void {
    this.fetchSpecialityOptions();
    window.addEventListener('confirmDelete', this._deleteListener = () => this.confirmDeleteSpeciality());
  }

  ngOnDestroy(): void {
    window.removeEventListener('confirmDelete', this._deleteListener);
  }

  private getTableData(pageOption: pageSelection): void {
    api.get('/speciality-options', { params: { skip: pageOption.skip, limit: pageOption.limit } })
      .then((res: any) => {
        this.tableData = [];
        this.serialNumberArray = [];
        this.totalData = res.data.totalData;
        res.data.data.map((res: specialities, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
            res.id = serialNumber;
            this.tableData.push(res);
            this.serialNumberArray.push(serialNumber);
          }
        });
        this.dataSource = new MatTableDataSource<specialities>(this.tableData);
        this.pagination.calculatePageSize.next({
          totalData: this.totalData,
          pageSize: this.pageSize,
          tableData: this.tableData,
          serialNumberArray: this.serialNumberArray,
          tableData2: [],
          tableData3: [],
          tableData4: []
        });
      })
      .catch(err => {
        console.error('Error fetching specialities:', err);
      });
  }

  fetchSpecialityOptions(page: number = this.currentPage, limit: number = this.pageSize) {
    this.loadingOptions = true;
    api.get('/speciality-options', { params: { page, limit } })
      .then(res => {
        const data = res.data;
        this.tableData = data.data.map((item: any, idx: number) => ({
          id: idx + 1 + (page - 1) * limit,
          ...item
        }));
        this.totalData = data.totalData;
        this.serialNumberArray = this.tableData.map((_, idx) => idx + 1); // Ensure serialNumberArray is updated
        this.loadingOptions = false;
        this.pagination.calculatePageSize.next({
          totalData: this.totalData,
          pageSize: this.pageSize,
          tableData: this.tableData,
          serialNumberArray: this.serialNumberArray,
          tableData2: [],
          tableData3: [],
          tableData4: []
        });
      })
      .catch(err => {
        this.errorOptions = err.response?.data?.message || 'Failed to load options';
        this.loadingOptions = false;
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchSpecialityOptions(page);
  }

  addSpeciality(name: string) {
    api.post('/speciality-options', { name, image: this.newSpecialityImage })
      .then(() => {
        this.fetchSpecialityOptions(1, this.pageSize); // Go to first page after add
        (window as any).$ && (window as any).$('#Add_Specialities_details').modal('hide');
        this.newSpecialityName = '';
        this.newSpecialityImage = '';
      });
  }

  openEditModal(speciality: any) {
    this.editSpecialityId = speciality._id;
    this.editSpecialityName = speciality.specialities || speciality.name;
    this.editSpecialityImage = speciality.image || '';
  }

  saveEditSpeciality() {
    if (!this.editSpecialityId) return;
    api.put(`/speciality-options/${this.editSpecialityId}`, { name: this.editSpecialityName, image: this.editSpecialityImage })
      .then(() => {
        this.fetchSpecialityOptions(this.currentPage, this.pageSize);
        (window as any).$ && (window as any).$('#edit_specialities_details').modal('hide');
        this.editSpecialityId = null;
        this.editSpecialityName = '';
        this.editSpecialityImage = '';
      });
  }

  openDeleteModal(speciality: any) {
    this.deleteSpecialityId = speciality._id;
  }

  confirmDeleteSpeciality() {
    if (!this.deleteSpecialityId) return;
    api.delete(`/speciality-options/${this.deleteSpecialityId}`)
      .then(() => {
        if (this.tableData.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.fetchSpecialityOptions(this.currentPage, this.pageSize);
        (window as any).$ && (window as any).$('#delete_modal').modal('hide');
        this.deleteSpecialityId = null;
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
}
