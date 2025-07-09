import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { DataService } from 'src/app/shared/data/data.service';
import {
  pageSelection,
  apiResultFormat,
  reviews,
} from 'src/app/shared/models/models';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-reviews',
    templateUrl: './reviews.component.html',
    styleUrls: ['./reviews.component.scss'],
    standalone: false
})
export class ReviewsComponent implements OnInit {
  public routes = routes;
  public tableData: Array<reviews> = [];
  reviews: any[] = [];
  totalReviews: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loadingReviews = false;
  errorReviews = '';

  // pagination variables
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<reviews>;
  public searchDataValue = '';
  // pagination variables end

  deleteReviewId: string | null = null;
  private _deleteListener: any;

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.reviews) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });

    // Subscribe to page size changes and fetch reviews with new page size
    this.pagination.changePagesize.subscribe((res: { pageSize: number }) => {
      this.pageSize = res.pageSize;
      this.currentPage = 1;
      this.fetchReviews(this.currentPage, this.pageSize);
    });
  }

  ngOnInit(): void {
    this.fetchReviews();
    window.addEventListener('confirmDelete', this._deleteListener = () => this.confirmDeleteReview());
  }

  ngOnDestroy(): void {
    window.removeEventListener('confirmDelete', this._deleteListener);
  }

  openDeleteModal(review: any) {
    this.deleteReviewId = review._id;
  }

  confirmDeleteReview() {
    if (!this.deleteReviewId) return;
    api.delete(`/reviews/${this.deleteReviewId}`)
      .then(() => {
        this.fetchReviews(this.currentPage, this.pageSize);
        this.deleteReviewId = null;
      });
  }

  private getTableData(pageOption: pageSelection): void {
    this.data.getReviews().subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: reviews, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.id = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<reviews>(this.tableData);
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

  fetchReviews(page: number = this.currentPage, limit: number = this.pageSize) {
    this.loadingReviews = true;
    api.get('/reviews', { params: { page, limit } })
      .then(res => {
        this.reviews = res.data.reviews;
        this.totalReviews = res.data.totalReviews;
        this.tableData = this.reviews.map((item: any, idx: number) => ({
          id: idx + 1 + (page - 1) * limit,
          ...item
        }));
        this.totalData = this.totalReviews;
        this.serialNumberArray = this.tableData.map((_, idx) => idx + 1);
        this.loadingReviews = false;
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
        this.errorReviews = err.response?.data?.message || 'Failed to load reviews';
        this.loadingReviews = false;
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchReviews(page);
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

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
