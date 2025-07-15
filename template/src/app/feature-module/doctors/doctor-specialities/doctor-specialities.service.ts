import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import api from 'src/app/shared/api/axios';

@Injectable({ providedIn: 'root' })
export class DoctorSpecialitiesService {
  private baseUrl = '/specialization';

  getSpecializations(doctorId: string): Observable<any> {
    return from(api.get(`${this.baseUrl}?doctorId=${doctorId}`));
  }

  createSpecializations(doctorId: string, specializations: any[]): Observable<any> {
    return from(api.post(this.baseUrl, { doctorId, specializations }));
  }

  updateSpecialization(id: string, data: any): Observable<any> {
    return from(api.put(`${this.baseUrl}/${id}`, data));
  }

  deleteSpecialization(id: string): Observable<any> {
    return from(api.delete(`${this.baseUrl}/${id}`));
  }

  addService(specializationId: string, service: any): Observable<any> {
    return from(api.post(`${this.baseUrl}/${specializationId}/services`, service));
  }

  updateService(specializationId: string, serviceId: string, service: any): Observable<any> {
    return from(api.put(`${this.baseUrl}/${specializationId}/services/${serviceId}`, service));
  }

  deleteService(specializationId: string, serviceId: string): Observable<any> {
    return from(api.delete(`${this.baseUrl}/${specializationId}/services/${serviceId}`));
  }

  getSpecialityOptions(): Observable<any> {
    return from(api.get('/speciality-options'));
  }
} 