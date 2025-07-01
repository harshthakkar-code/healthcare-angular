import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
import { ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-reviews',
    templateUrl: './reviews.component.html',
    styleUrls: ['./reviews.component.scss'],
    standalone: false
})
export class ReviewsComponent implements OnInit {
  public routes = routes;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();

  allReviews: any[] = [];
  filteredReviews: any[] = [];
  reviews: any[] = [];
  avgRating: number = 0;
  doctorId: string | null = null;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 5;
  totalReviews: number = 0;
  totalPages: number = 1;

  constructor(
    private route: ActivatedRoute
  ) {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.paramMap.get('doctorId');
    if (!this.doctorId) {
      this.doctorId = this.getDoctorIdFromLocalStorage();
    }
    if (this.doctorId) {
      this.loadReviews();
    }
  }

  getDoctorIdFromLocalStorage(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  async loadReviews() {
    try {
      const res = await api.get(`/reviews/doctor/${this.doctorId}`);
      const data = res.data;
      this.allReviews = data.reviews;
      this.avgRating = data.avgRating;
      this.applyDateFilter();
    } catch (error) {
      this.allReviews = [];
      this.filteredReviews = [];
      this.reviews = [];
      this.avgRating = 0;
      this.totalReviews = 0;
      this.totalPages = 1;
    }
  }

  applyDateFilter() {
    if (this.bsRangeValue && this.bsRangeValue.length === 2 && this.bsRangeValue[0] && this.bsRangeValue[1]) {
      const from = new Date(this.bsRangeValue[0]).setHours(0,0,0,0);
      const to = new Date(this.bsRangeValue[1]).setHours(23,59,59,999);
      this.filteredReviews = this.allReviews.filter(r => {
        const created = new Date(r.createdAt).getTime();
        return created >= from && created <= to;
      });
    } else {
      this.filteredReviews = [...this.allReviews];
    }
    this.totalReviews = this.filteredReviews.length;
    this.totalPages = Math.ceil(this.totalReviews / this.pageSize) || 1;
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.reviews = this.filteredReviews.slice(start, end);
  }

  onDateRangeChange() {
    this.currentPage = 1;
    this.applyDateFilter();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updatePage();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }
}
