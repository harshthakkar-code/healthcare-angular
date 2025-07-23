import { Component, OnInit } from '@angular/core';
import api from 'src/app/shared/api/axios';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-doctor-payment',
    templateUrl: './doctor-payment.component.html',
    styleUrl: './doctor-payment.component.scss',
    standalone: false
})
export class DoctorPaymentComponent implements OnInit {
  activeBox: number = 2;
  payouts: any[] = [];
  loading = true;
  error: string | null = null;
  doctorId: string | null = null;
  search: string = '';
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  paginatedPayouts: any[] = [];
  searchText: string = '';
  filteredPayouts: any[] = [];
  stripeConnected: boolean | null = null;
  stripeStatusDetails: any = null;
  stripeLoading = false;
  transactions: any[] = [];
constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.checkStripeStatus();
  this.route.queryParams.subscribe(params => {
    if (params['onboarded'] === '1') {
      // Clean up query params from URL
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }
    if (params['refresh'] === '1') {
      // Automatically request a new onboarding link
      this.startStripeOnboarding();
      // Clean up query params from URL
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }
  });

  this.doctorId = this.getDoctorId();
  if (!this.doctorId) {
    this.error = 'Error: Doctor ID not found. Please log in again.';
    this.loading = false;
    return;
  }
  this.fetchPayouts();
}

  getDoctorId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  // fetchPayouts(): void {
  //   this.loading = true;
  //   api.get(`/transactions/user/${this.doctorId}?role=doctor`)
  //     .then(res => {
  //       this.payouts = res.data.data || [];
  //       console.log('Fetched payouts:', this.payouts);
  //       this.loading = false;
  //     })
  //     .catch(() => {
  //       this.loading = false;
  //       this.error = 'Failed to load payouts.';
  //     });
  // }
 
 stripeBalance = {
  pending: 0,
  available: 0
};

fetchPayouts(): void {
  this.loading = true;
  api.get(`/transactions/stripe/payouts/${this.doctorId}`)
    .then(res => {
      this.payouts = res.data.payoutsInserted || [];
      this.searchPayouts();

      // 🟡 Store stripe balance values
      if (res.data.stripeBalance) {
        this.stripeBalance.pending = res.data.stripeBalance.pending || 0;
        this.stripeBalance.available = res.data.stripeBalance.available || 0;
      }

      this.loading = false;
    })
    .catch(() => {
      this.loading = false;
      this.error = 'Failed to load payouts.';
    });
}

  searchPayouts(): void {
    const search = this.searchText.trim().toLowerCase();
    if (!search) {
      this.filteredPayouts = [...this.payouts];
    } else {
      this.filteredPayouts = this.payouts.filter(payout =>
        (payout.paymentMethod && payout.paymentMethod.toLowerCase().includes(search)) ||
        (payout.status && payout.status.toLowerCase().includes(search)) ||
        (payout.amount && payout.amount.toString().includes(search))
      );
    }
    this.total = this.filteredPayouts.length;
    this.totalPages = Math.ceil(this.total / this.pageSize) || 1;
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPayouts = this.filteredPayouts.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updatePage();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  get paginationPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  }

  onPageClick(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.goToPage(page);
    }
  }

  toggleActive(boxNumber: number): void {
    this.activeBox = boxNumber; 
  }

  onSearchChange(): void {
    this.searchPayouts();
  }

  checkStripeStatus(): void {
    this.stripeLoading = true;
    api.get('/doctor/stripe/status')
      .then(res => {
        this.stripeConnected = res.data.connected;
        this.stripeStatusDetails = res.data.details;
        this.stripeLoading = false;
      })
      .catch(() => {
        this.stripeConnected = false;
        this.stripeLoading = false;
      });
  }

  startStripeOnboarding(): void {
    this.stripeLoading = true;
    api.post('/doctor/stripe/onboard')
      .then(res => {
        window.location.href = res.data.url;
      })
      .catch(() => {
        this.error = 'Failed to start Stripe onboarding.';
        this.stripeLoading = false;
      });
  }
}
