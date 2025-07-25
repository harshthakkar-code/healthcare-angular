import {
  Component,
  ViewChild,
  ElementRef,
  NgZone,
  AfterViewInit
} from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from '../patient-registration.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import api from 'src/app/shared/api/axios';

declare const google: any;

@Component({
  selector: 'app-patient-register-step5',
  templateUrl: './patient-register-step5.component.html',
  styleUrls: ['./patient-register-step5.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class PatientRegisterStep5Component implements AfterViewInit {
  public routes = routes;

  city: string = '';
  state: string = '';
  cityError: string = '';
  stateError: string = '';
  currentStep = 5;

  @ViewChild('cityInput') cityInput!: ElementRef;

  constructor(
    private patientRegService: PatientRegistrationService,
    private router: Router,
    private ngZone: NgZone
  ) {
    const data = this.patientRegService.getAllData();
    this.city = data['city'] || '';
    this.state = data['state'] || '';
  }

  ngAfterViewInit(): void {
    const autocomplete = new google.maps.places.Autocomplete(
      this.cityInput.nativeElement,
      { types: ['(cities)'] }
    );

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;

        for (const component of place.address_components) {
          const types = component.types;
          if (types.includes('locality')) {
            this.city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            this.state = component.long_name;
          }
        }
      });
    });
  }

  goToStep(step: number) {
    this.router.navigate([`/patients/register/patient-register-step${step}`]);
  }

  async onComplete() {
    this.cityError = '';
    this.stateError = '';

    let valid = true;
    if (!this.city.trim()) {
      this.cityError = 'City is required';
      valid = false;
    }
    if (!this.state.trim()) {
      this.stateError = 'State is required';
      valid = false;
    }

    if (!valid) return;

    this.patientRegService.setStepData({ city: this.city, state: this.state });
    const allData = this.patientRegService.getAllData();
    const payload = { ...allData, role: 'patient' };

    try {
      const response = await api.post('/auth/register', payload);
      console.log('Registration successful:', response.data);
      this.patientRegService.clear();
      this.router.navigate(['/authentication/register/registration-success']);
    } catch (error) {
      const err = error as any;
      console.error('Registration failed:', err.response?.data || err.message);
    }
  }
}
