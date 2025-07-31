import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvoiceModalService {
  private invoiceSource = new BehaviorSubject<any>(null);
  invoice$ = this.invoiceSource.asObservable();

  setInvoice(invoice: any) {
    this.invoiceSource.next(invoice);
  }
} 