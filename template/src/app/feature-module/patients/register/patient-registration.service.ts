import { Injectable } from '@angular/core';

export interface PatientRegistrationData {
  // Step 1
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  // Step 2
  gender?: string;
  address?: string;
  address2?: string;
  // Step 3
  pincode?: string;
  // Step 4
  weight?: string;
  height?: string;
  age?: string;
  blood?: string;
  // Step 4 (family ages and images)
  child1Age?: string;
  child1Image?: string;
  spouseAge?: string;
  spouseImage?: string;
  fatherAge?: string;
  fatherImage?: string;
  motherAge?: string;
  motherImage?: string;
  // Step 5
  city?: string;
  state?: string;
  [key: string]: any; // For any extra fields in future
}

const STORAGE_KEY = 'patient_registration_data';

@Injectable({ providedIn: 'root' })
export class PatientRegistrationService {
  private data: PatientRegistrationData = {};

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

  setStepData(stepData: Partial<PatientRegistrationData>) {
    this.data = { ...this.data, ...stepData };
    this.saveToStorage();
  }

  getAllData(): PatientRegistrationData {
    return { ...this.data };
  }

  getField<K extends keyof PatientRegistrationData>(key: K): PatientRegistrationData[K] {
    return this.data[key];
  }

  clear() {
    this.data = {};
    localStorage.removeItem(STORAGE_KEY);
  }
} 