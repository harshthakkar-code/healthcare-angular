import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from '../patient-registration.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
    selector: 'app-patient-register-step3',
    templateUrl: './patient-register-step3.component.html',
    styleUrls: ['./patient-register-step3.component.scss'],
    standalone: true,
    imports: [FormsModule, RouterModule]
})
export class PatientRegisterStep3Component {
  public routes = routes;
  public insuranceSelf: boolean = true;
  public insuranceSpouse: boolean = false;
  public insuranceChildCount: number = 0;
  public insuranceMother: boolean = false;
  public insuranceFather: boolean = false;
  currentStep = 3;
  goToStep(step: number) {
    if (step === 1) {
      this.router.navigate(['/patients/register/patient-register-step1']);
    } else if (step === 2) {
      this.router.navigate(['/patients/register/patient-register-step2']);
    } else if (step === 3) {
      // Already on step 3
    } else if (step === 4) {
      // this.router.navigate(['/patients/register/patient-register-step4']);
    } else if (step === 5) {
      // this.router.navigate(['/patients/register/patient-register-step5']);
    }
  }

  constructor(private patientRegService: PatientRegistrationService, private router: Router) {
    const data = this.patientRegService.getAllData();
    this.insuranceSelf = data['insuranceSelf'] ?? true;
    this.insuranceSpouse = data['insuranceSpouse'] ?? false;
    this.insuranceChildCount = data['insuranceChildCount'] ?? 0;
    this.insuranceMother = data['insuranceMother'] ?? false;
    this.insuranceFather = data['insuranceFather'] ?? false;
  }

  addPos() {
    this.insuranceChildCount++;
  }
  reducePos() {
    if (this.insuranceChildCount > 0) this.insuranceChildCount--;
  }

  continue() {
    // Always ensure at least 'self' is selected
    if (!this.insuranceSelf && !this.insuranceSpouse && !this.insuranceMother && !this.insuranceFather && this.insuranceChildCount === 0) {
      this.insuranceSelf = true;
    }
    this.patientRegService.setStepData({
      insuranceSelf: this.insuranceSelf,
      insuranceSpouse: this.insuranceSpouse,
      insuranceChildCount: this.insuranceChildCount,
      insuranceMother: this.insuranceMother,
      insuranceFather: this.insuranceFather
    });
    this.router.navigate([this.routes.patientregister4]);
  }
}
