import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { DataService } from 'src/app/shared/data/data.service';
import {
  transactionsList,
  pageSelection,
  apiResultFormat,
} from 'src/app/shared/models/models';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-transactions-list',
    templateUrl: './transactions-list.component.html',
    styleUrls: ['./transactions-list.component.scss'],
    standalone: false
})
export class TransactionsListComponent implements OnInit {
  public routes = routes;
  public tableData: Array<transactionsList> = [];
  transactions: any[] = [];
  totalTransactions: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading = false;
  error = '';

  // pagination variables
  public serialNumberArray: Array<number> = [];
  showFilter = false;
  dataSource!: MatTableDataSource<transactionsList>;
  public searchDataValue = '';
  // pagination variables end

  deleteTransactionId: string | null = null;
  private _deleteListener: any;

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.adminTransactionsList) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });
  }

  ngOnInit(): void {
    this.fetchTransactions();
    window.addEventListener('confirmDelete', this._deleteListener = () => this.confirmDeleteTransaction());
  }

  ngOnDestroy(): void {
    window.removeEventListener('confirmDelete', this._deleteListener);
  }

  openDeleteModal(tx: any) {
    this.deleteTransactionId = tx._id;
  }

  confirmDeleteTransaction() {
    if (!this.deleteTransactionId) return;
    api.delete(`/transactions/${this.deleteTransactionId}`)
      .then(() => {
        this.fetchTransactions(this.currentPage, this.pageSize);
        this.deleteTransactionId = null;
      });
  }

  private getTableData(pageOption: pageSelection): void {
    this.data.getTransactionsList().subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      apiRes.data.map((res: transactionsList, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.id = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<transactionsList>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalTransactions,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
        tableData2: [],
        tableData3: [],
        tableData4: []
      });
    });
  }

  fetchTransactions(page: number = this.currentPage, limit: number = this.pageSize) {
    this.loading = true;
    api.get('/transactions', { params: { page, limit } })
      .then(res => {
        this.transactions = res.data.data;
        this.totalTransactions = res.data.total;
        this.loading = false;
      })
      .catch(err => {
        this.error = err.response?.data?.message || 'Failed to load transactions';
        this.loading = false;
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchTransactions(page);
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
