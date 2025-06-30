import { Injectable } from '@angular/core';
import api from '../api/axios';

@Injectable({ providedIn: 'root' })
export class TestService {
  async testConnection(): Promise<any> {
    try {
      const response = await api.get('/auth/test');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
} 