import { Injectable } from '@angular/core';
import api from 'src/app/shared/api/axios';

@Injectable({ providedIn: 'root' })
export class PatientDashboardService {
  // Get patient profile using /patient/profile endpoint
  async getProfile() {
    const response = await api.get('/patient/profile');
    return response.data;
  }

  // Example: Get appointments (still uses patientId)
  async getAppointments(patientId: string) {
    const response = await api.get(`/patients/${patientId}/appointments`);
    return response.data;
  }

  // Add more methods for your other APIs as needed
} 