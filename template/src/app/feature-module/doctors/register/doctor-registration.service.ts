import { Injectable } from '@angular/core';

export interface DoctorRegistrationData {
  // Step 0
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  // Step 1
  profileImage?: string; // Can be a base64 string or URL
  // Step 2
  gender?: string;
  isRegistered?: boolean;
  registerYears?: string;
  address?: string;
  address2?: string;
  pincode?: string;
  clinicAddress?: string;
  qualiCertificate?: string; // base64 or file name
  photoId?: string; // base64 or file name
  clinicalEmployment?: string; // base64 or file name
  weight?: string;
  weightUnit?: string;
  height?: string;
  heightUnit?: string;
  age?: string;
  blood?: string;
  bio?: string;
  specialization?: string;
  experience?: string;
  services?: string[];
  // Step 3
  city?: string;
  state?: string;
}

const STORAGE_KEY = 'doctor_registration_data';

@Injectable({ providedIn: 'root' })
export class DoctorRegistrationService {
  private data: DoctorRegistrationData = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
      } catch {
        this.data = {};
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  setStepData(stepData: Partial<DoctorRegistrationData>) {
    this.data = { ...this.data, ...stepData };
    this.saveToStorage();
  }

  getAllData(): DoctorRegistrationData {
    return { ...this.data };
  }

  getField<K extends keyof DoctorRegistrationData>(key: K): DoctorRegistrationData[K] {
    return this.data[key];
  }

  clear() {
    this.data = {};
    localStorage.removeItem(STORAGE_KEY);
  }
} 