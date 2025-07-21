import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from '../patient-registration.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-patient-register-step2',
    templateUrl: './patient-register-step2.component.html',
    styleUrls: ['./patient-register-step2.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule]
})
export class PatientRegisterStep2Component {
  public routes = routes;
  displayStyle = 'none';

  gender: string = '';
  isPregnant: boolean = false;
  pregnancyTerm: string = '';
  weight: string = '';
  weightUnit: string = 'kg';
  height: string = '';
  heightUnit: string = 'cm';
  age: string = '';
  blood: string = '';
  heartRate: string = '';
  bp: string = '';
  glucose: string = '';
  allergies: string = '';
  preExisting: boolean = false;
  medication: boolean = false;
  conditions: string[] = [];
  medicines: string[] = [];
  dosages: string[] = [];

  genderError = '';
  weightError = '';
  heightError = '';
  ageError = '';
  bloodError = '';
  pregnancyTermError = '';

  currentStep = 2;
  goToStep(step: number) {
    if (step === 1) {
      this.router.navigate(['/patients/register/patient-register-step1']);
    } else if (step === 2) {
      // Already on step 2
    } else if (step === 3) {
      // this.router.navigate(['/patients/register/patient-register-step3']);
    } else if (step === 4) {
      // this.router.navigate(['/patients/register/patient-register-step4']);
    } else if (step === 5) {
      // this.router.navigate(['/patients/register/patient-register-step5']);
    }
  }

  constructor(private patientRegService: PatientRegistrationService, private router: Router) {
    const data = this.patientRegService.getAllData();
    this.gender = data['gender'] || '';
    this.isPregnant = data['isPregnant'] || false;
    this.pregnancyTerm = data['pregnancyTerm'] || '';
    this.weight = data['weight'] || '';
    this.weightUnit = data['weightUnit'] || 'kg';
    this.height = data['height'] || '';
    this.heightUnit = data['heightUnit'] || 'cm';
    this.age = data['age'] || '';
    this.blood = data['blood'] || '';
    this.heartRate = data['heartRate'] || '';
    this.bp = data['bp'] || '';
    this.glucose = data['glucose'] || '';
    this.allergies = data['allergies'] || '';
    this.preExisting = data['preExisting'] || false;
    this.medication = data['medication'] || false;
    this.conditions = data['conditions'] || [];
    this.medicines = data['medicines'] || [];
    this.dosages = data['dosages'] || [];
  }

  toggleDisplay() {
    this.displayStyle = this.displayStyle === 'none' ? 'block' : 'none';
  }

  continue() {
    this.genderError = '';
    this.weightError = '';
    this.heightError = '';
    this.ageError = '';
    this.bloodError = '';
    this.pregnancyTermError = '';

    let valid = true;
    if (!this.gender) {
      this.genderError = 'Gender is required';
      valid = false;
    }
    if (!this.weight.trim()) {
      this.weightError = 'Weight is required';
      valid = false;
    }
    if (!this.height.trim()) {
      this.heightError = 'Height is required';
      valid = false;
    }
    if (!this.age.trim()) {
      this.ageError = 'Age is required';
      valid = false;
    }
    if (!this.blood) {
      this.bloodError = 'Blood type is required';
      valid = false;
    }
    if (this.gender === 'Female' && this.isPregnant && !this.pregnancyTerm) {
      this.pregnancyTermError = 'Pregnancy Term is required';
      valid = false;
    }

    if (!valid) {
      return;
    }

    this.patientRegService.setStepData({
      gender: this.gender.toLowerCase(),
      isPregnant: this.isPregnant,
      pregnancyTerm: this.pregnancyTerm,
      weight: this.weight,
      weightUnit: this.weightUnit,
      height: this.height,
      heightUnit: this.heightUnit,
      age: this.age,
      blood: this.blood,
      heartRate: this.heartRate,
      bp: this.bp,
      glucose: this.glucose,
      allergies: this.allergies,
      preExisting: this.preExisting,
      medication: this.medication,
      conditions: this.conditions,
      medicines: this.medicines,
      dosages: this.dosages
    });
    this.router.navigate([this.routes.patientregister3]);
  }
}
