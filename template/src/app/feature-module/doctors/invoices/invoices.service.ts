import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import api from 'src/app/shared/api/axios';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  getInvoices(params: { page?: number; limit?: number; search?: string }): Observable<any> {
    return from(api.get('/invoices', { params }));
  }

  getInvoicesByUserId(userId: string, params: { page?: number; limit?: number; search?: string }): Observable<any> {
    // Call the doctor invoices endpoint
    return from(api.get(`/invoices/doctor/${userId}`, { params }));
  }

  getInvoiceById(id: string): Observable<any> {
    return from(api.get(`/invoices/${id}`));
  }
} 