import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from '../patient-registration.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { uploadImage } from 'src/app/shared/api/image-upload';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-patient-register-step4',
    templateUrl: './patient-register-step4.component.html',
    styleUrls: ['./patient-register-step4.component.scss'],
    standalone: true,
    imports: [FormsModule, RouterModule, CommonModule]
})
export class PatientRegisterStep4Component {
  public routes = routes;

  showSelf = true;
  showSpouse = false;
  showChild = false;
  showMother = false;
  showFather = false;
  childCount = 0;

  selfAge: string = '';
  selfImage: string = '';
  childAges: string[] = [];
  childImages: string[] = [];
  childAgeErrors: string[] = [];
  spouseAge: string = '';
  spouseImage: string = '';
  fatherAge: string = '';
  fatherImage: string = '';
  motherAge: string = '';
  motherImage: string = '';

  // Error messages
  selfAgeError = '';
  spouseAgeError = '';
  fatherAgeError = '';
  motherAgeError = '';

  currentStep = 4;
  goToStep(step: number) {
    if (step === 1) {
      this.router.navigate(['/patients/register/patient-register-step1']);
    } else if (step === 2) {
      this.router.navigate(['/patients/register/patient-register-step2']);
    } else if (step === 3) {
      this.router.navigate(['/patients/register/patient-register-step3']);
    } else if (step === 4) {
      // Already on step 4
    } else if (step === 5) {
      // this.router.navigate(['/patients/register/patient-register-step5']);
    }
  }

  constructor(private patientRegService: PatientRegistrationService, private router: Router) {
    const data = this.patientRegService.getAllData();
    this.showSelf = data['insuranceSelf'] ?? true;
    this.showSpouse = data['insuranceSpouse'] ?? false;
    this.childCount = data['insuranceChildCount'] ?? 0;
    this.showChild = this.childCount > 0;
    this.showMother = data['insuranceMother'] ?? false;
    this.showFather = data['insuranceFather'] ?? false;
    this.selfAge = data['selfAge'] || '';
    this.selfImage = data['selfImage'] || '';
    // Initialize children arrays
    this.childAges = [];
    this.childImages = [];
    this.childAgeErrors = [];
    for (let i = 0; i < this.childCount; i++) {
      this.childAges[i] = (data['childAges'] && data['childAges'][i]) || '';
      this.childImages[i] = (data['childImages'] && data['childImages'][i]) || '';
      this.childAgeErrors[i] = '';
    }
    this.spouseAge = data['spouseAge'] || '';
    this.spouseImage = data['spouseImage'] || '';
    this.fatherAge = data['fatherAge'] || '';
    this.fatherImage = data['fatherImage'] || '';
    this.motherAge = data['motherAge'] || '';
    this.motherImage = data['motherImage'] || '';
  }

  async onImageSelected(event: any, field: string, index?: number) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      switch (field) {
        case 'selfImage':
          this.selfImage = url;
          break;
        case 'childImage':
          if (typeof index === 'number') {
            this.childImages[index] = url;
          }
          break;
        case 'spouseImage':
          this.spouseImage = url;
          break;
        case 'fatherImage':
          this.fatherImage = url;
          break;
        case 'motherImage':
          this.motherImage = url;
          break;
      }
      if (field === 'childImage' && typeof index === 'number') {
        this.patientRegService.setStepData({ childImages: this.childImages });
      } else {
        this.patientRegService.setStepData({ [field]: url });
      }
    } catch (err) {
      console.error('Image upload failed', err);
    }
  }

  continue() {
    // Reset errors
    this.selfAgeError = '';
    this.childAgeErrors = Array(this.childCount).fill('');
    this.spouseAgeError = '';
    this.fatherAgeError = '';
    this.motherAgeError = '';
    let valid = true;
    if (this.showSelf && !this.selfAge.trim()) {
      this.selfAgeError = 'Self age is required';
      valid = false;
    }
    if (this.showChild) {
      for (let i = 0; i < this.childCount; i++) {
        if (!this.childAges[i] || !this.childAges[i].trim()) {
          this.childAgeErrors[i] = `Child ${i + 1} age is required`;
          valid = false;
        }
      }
    }
    if (this.showSpouse && !this.spouseAge.trim()) {
      this.spouseAgeError = 'Spouse age is required';
      valid = false;
    }
    if (this.showFather && !this.fatherAge.trim()) {
      this.fatherAgeError = 'Father age is required';
      valid = false;
    }
    if (this.showMother && !this.motherAge.trim()) {
      this.motherAgeError = 'Mother age is required';
      valid = false;
    }
    if (!valid) return;
    this.patientRegService.setStepData({
      selfAge: this.selfAge,
      selfImage: this.selfImage,
      childAges: this.childAges,
      childImages: this.childImages,
      spouseAge: this.spouseAge,
      spouseImage: this.spouseImage,
      fatherAge: this.fatherAge,
      fatherImage: this.fatherImage,
      motherAge: this.motherAge,
      motherImage: this.motherImage
    });
    this.router.navigate([this.routes.patientregister5]);
  }
}
