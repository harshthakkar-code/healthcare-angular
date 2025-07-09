import { Component, OnInit, OnDestroy } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-invoice-report',
    templateUrl: './invoice-report.component.html',
    styleUrls: ['./invoice-report.component.scss'],
    standalone: false
})
export class InvoiceReportComponent implements OnInit, OnDestroy {
  public routes = routes;
  invoices: any[] = [];
  totalInvoices: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading = false;
  error = '';
  deleteInvoiceId: string | null = null;
  editInvoice: any = null;
  private _deleteListener: any;

  constructor(
    private pagination: PaginationService,
    private router: Router
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.adminInvoiceReport) {
        this.pageSize = res.pageSize;
        this.currentPage = Math.floor(res.skip / res.pageSize) + 1;
        this.fetchInvoices(this.currentPage, this.pageSize);
      }
    });
  }

  ngOnInit(): void {
    this.fetchInvoices();
    window.addEventListener('confirmDelete', this._deleteListener = () => this.confirmDeleteInvoice());
  }

  ngOnDestroy(): void {
    window.removeEventListener('confirmDelete', this._deleteListener);
  }

  fetchInvoices(page: number = this.currentPage, limit: number = this.pageSize) {
    this.loading = true;
    api.get('/transactions', { params: { page, limit } })
      .then(res => {
        this.invoices = res.data.data;
        this.totalInvoices = res.data.total;
        this.loading = false;
        // Update pagination service with new data
        this.pagination.calculatePageSize.next({
          totalData: this.totalInvoices,
          pageSize: this.pageSize,
          tableData: this.invoices,
          serialNumberArray: this.invoices.map((_, i) => (this.currentPage - 1) * this.pageSize + i + 1),
          tableData2: [],
          tableData3: [],
          tableData4: []
        });
      })
      .catch(err => {
        this.error = err.response?.data?.message || 'Failed to load invoices';
        this.loading = false;
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchInvoices(page);
  }

  openDeleteModal(invoice: any) {
    this.deleteInvoiceId = invoice._id;
  }

  confirmDeleteInvoice() {
    if (!this.deleteInvoiceId) return;
    api.delete(`/transactions/${this.deleteInvoiceId}`)
      .then(() => {
        this.fetchInvoices(this.currentPage, this.pageSize);
        this.deleteInvoiceId = null;
      });
  }

  openEditModal(invoice: any) {
    this.editInvoice = { ...invoice };
  }

  updateInvoice() {
    if (!this.editInvoice || !this.editInvoice._id) return;
    api.put(`/transactions/${this.editInvoice._id}`, this.editInvoice)
      .then(() => {
        this.fetchInvoices(this.currentPage, this.pageSize);
        // Close the modal after save
        const modal = document.getElementById('edit_invoice_report');
        if (modal) {
          (window as any).bootstrap?.Modal.getOrCreateInstance(modal).hide();
        }
      });
  }

  public sortData(sort: Sort) {
    const data = this.invoices.slice();
    if (!sort.active || sort.direction === '') {
      this.invoices = data;
    } else {
      this.invoices = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }
}
