import axios from 'axios';
import { environment } from '../../../environments/environment';

// Create a local imageApi instance for image uploads (no Content-Type header)
const imageApi = axios.create({
  baseURL: environment.API_URL
});

imageApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

imageApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await imageApi.post('/upload/image', formData);
  return res.data.imageUrl;
} 