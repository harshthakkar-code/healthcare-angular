import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from '../patient-registration.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { uploadImage } from 'src/app/shared/api/image-upload';

@Component({
    selector: 'app-patient-register-step1',
    templateUrl: './patient-register-step1.component.html',
    styleUrls: ['./patient-register-step1.component.scss'],
    standalone: true,
    imports: [FormsModule, RouterModule]
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
    this.regService.setStepData({ profileImage: this.profileImage });
    this.router.navigate(['/patients/register/patient-register-step2']);
  }
}
