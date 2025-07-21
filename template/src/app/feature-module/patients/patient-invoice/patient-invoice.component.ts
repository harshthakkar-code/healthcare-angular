import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientInvoiceService } from './patient-invoice.service';
import { InvoiceModalService } from '../../doctors/invoices/invoice-modal.service';


@Component({
    selector: 'app-patient-invoice',
    templateUrl: './patient-invoice.component.html',
    styleUrl: './patient-invoice.component.scss',
    standalone: false
})
export class PatientInvoiceComponent implements OnInit {
  public routes = routes;
  transactions: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  search = '';
  loading = false;

  constructor(private patientInvoiceService: PatientInvoiceService ,  private invoiceModalService: InvoiceModalService) {}

  ngOnInit() {
    this.fetchTransactions();
  }

  fetchTransactions() {
    this.loading = true;
    const patientId = this.getPatientId();
    if (!patientId) {
      this.transactions = [];
      this.total = 0;
      this.loading = false;
      return;
    }
    this.patientInvoiceService.getTransactions(patientId, { page: this.page, limit: this.limit, search: this.search }).subscribe({
      next: (res) => {
        this.transactions = res.data.data || [];
        this.total = res.data.total || 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getPatientId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
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

  get totalPages(): number[] {
    return Array(Math.ceil(this.total / this.limit)).fill(0).map((x, i) => i + 1);
  }
  openInvoiceModal(invoiceId: string) {
    this.patientInvoiceService.getInvoiceById(invoiceId).subscribe({
      next: (res: any) => {
        this.invoiceModalService.setInvoice(res.data);
      },
      error: () => {
        this.invoiceModalService.setInvoice(null);
      }
    });
  }
}
