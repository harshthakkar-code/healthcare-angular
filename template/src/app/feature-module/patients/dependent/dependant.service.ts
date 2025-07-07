import { Injectable } from '@angular/core';
import { Observable, from, Subject } from 'rxjs';
import api from 'src/app/shared/api/axios';

@Injectable({ providedIn: 'root' })
export class DependantService {
  private dependantsChangedSource = new Subject<void>();
  dependantsChanged$ = this.dependantsChangedSource.asObservable();

  getDependants(userId: string): Observable<any> {
    return from(api.get('/dependants', { params: { userId } }));
  }
  getDependantById(id: string): Observable<any> {
    return from(api.get(`/dependants/${id}`));
  }
  addDependant(data: any): Observable<any> {
    return from(api.post('/dependants', data));
  }
  updateDependant(id: string, data: any): Observable<any> {
    return from(api.put(`/dependants/${id}`, data));
  }
  deleteDependant(id: string): Observable<any> {
    return from(api.delete(`/dependants/${id}`));
  }
  notifyDependantsChanged() {
    this.dependantsChangedSource.next();
  }
} 