import { Component, OnInit } from '@angular/core';
import { InvoicesService } from './invoices.service';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-invoices',
  standalone: false,
  
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent implements OnInit {
  routes = routes;
  transactions: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  search = '';
  loading = false;

  constructor(private invoicesService: InvoicesService) {}

  ngOnInit() {
    this.fetchTransactions();
  }

  fetchTransactions() {
    this.loading = true;
    const userId = this.getUserIdFromLocalStorage();
    if (!userId) {
      this.transactions = [];
      this.loading = false;
      return;
    }
    this.invoicesService.getInvoicesByUserId(userId, { page: this.page, limit: this.limit, search: this.search }).subscribe({
      next: (res) => {
        this.transactions = res.data.data || [];
        this.total = res.data.total || 0;
        this.loading = false;
        console.log('Transactions:', this.transactions);
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(term: string) {
    this.page = 1;
    this.search = term;
    this.fetchTransactions();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.fetchTransactions();
  }

  get Math() {
    return Math;
  }

  getPatientInitials(name: string | undefined): string {
    if (!name) return 'PN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  get totalPages(): number[] {
    return Array(Math.ceil(this.total / this.limit)).fill(0).map((x, i) => i + 1);
  }

  getUserIdFromLocalStorage(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }
}
