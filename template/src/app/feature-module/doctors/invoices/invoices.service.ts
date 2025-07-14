import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import api from 'src/app/shared/api/axios';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  getTransactions(params: { page?: number; limit?: number; search?: string }): Observable<any> {
    return from(api.get('/transactions/user/', { params }));
  }

  getTransactionsByUserId(userId: string, params: { page?: number; limit?: number; search?: string }): Observable<any> {
    return from(api.get(`/transactions/user/${userId}`, { params }));
  }
} 