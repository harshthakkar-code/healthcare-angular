import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import api from 'src/app/shared/api/axios';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private baseUrl = '/slots';

  getSlots(doctorId: string, params?: any): Observable<any> {
    return from(api.get(`${this.baseUrl}/${doctorId}`, { params }));
  }

  createSlots(data: any): Observable<any> {
    return from(api.post(this.baseUrl, data));
  }

  updateSlot(slotId: string, data: any): Observable<any> {
    return from(api.put(`${this.baseUrl}/${slotId}`, data));
  }

  deleteSlot(slotId: string): Observable<any> {
    return from(api.delete(`${this.baseUrl}/${slotId}`));
  }

  deleteSlots(slotIds: string[]): Observable<any> {
    return from(api.post('/slots/bulk-delete', { ids: slotIds }));
  }

  checkSlotOverlap(data: any): Observable<any> {
    return from(api.post(this.baseUrl + '/check-overlap', data));
  }
} 