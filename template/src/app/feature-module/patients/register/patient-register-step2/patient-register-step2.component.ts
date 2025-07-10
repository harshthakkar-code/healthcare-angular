import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from '../patient-registration.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-patient-register-step2',
    templateUrl: './patient-register-step2.component.html',
    styleUrls: ['./patient-register-step2.component.scss'],
    standalone: true,
    imports: [FormsModule, RouterModule]
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
    this.patientRegService.setStepData({
      gender: this.gender,
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
