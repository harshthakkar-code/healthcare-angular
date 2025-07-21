import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from '../patient-registration.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { uploadImage } from 'src/app/shared/api/image-upload';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-patient-register-step1',
    templateUrl: './patient-register-step1.component.html',
    styleUrls: ['./patient-register-step1.component.scss'],
    standalone: true,
    imports: [FormsModule, RouterModule, CommonModule]
})
export class PatientRegisterStep1Component {
  public routes = routes;
  profileImage: string = '';
  uploading: boolean = false;
  uploadError: string = '';
  name: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  profileImageError = '';
  currentStep = 1;

  constructor(private router: Router, private regService: PatientRegistrationService) {
    const data = this.regService.getAllData();
    this.profileImage = data['profileImage'] || '';
    this.name = data['name'] || '';
    this.email = data['email'] || '';
    this.phone = data['phone'] || '';
    this.password = data['password'] || '';
  }

  async onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError = 'Only JPG and PNG images are allowed.';
      return;
    }
    this.uploadError = '';
    this.uploading = true;
    try {
      const url = await uploadImage(file);
      this.profileImage = url;
    } catch (err) {
      this.uploadError = 'Upload failed. Please try again.';
    }
    this.uploading = false;
  }

  removeProfileImage() {
    this.profileImage = '';
  }

  continue() {
    this.regService.setStepData({
      profileImage: this.profileImage,
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password
    });
    this.router.navigate([this.routes.patientregister2]);
  }

  nextStep() {
    this.profileImageError = '';
    if (!this.profileImage) {
      this.profileImageError = 'Profile picture is required';
      return;
    }
    this.regService.setStepData({ profileImage: this.profileImage });
    this.router.navigate(['/patients/register/patient-register-step2']);
  }

  goToStep(step: number) {
    if (step === 1) {
      // Already on step 1
    } else if (step === 2) {
      // this.router.navigate(['/patients/register/patient-register-step2']);
    } else if (step === 3) {
      // this.router.navigate(['/patients/register/patient-register-step3']);
    } else if (step === 4) {
      // this.router.navigate(['/patients/register/patient-register-step4']);
    } else if (step === 5) {
      // this.router.navigate(['/patients/register/patient-register-step5']);
    }
  }
}
