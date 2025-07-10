import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorRegistrationService } from '../doctor-registration.service';
import { uploadImage } from 'src/app/shared/api/image-upload';

@Component({
  selector: 'app-doctor-register-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-register-step1.component.html',
  styleUrls: ['./doctor-register-step1.component.scss']
})
export class DoctorRegisterStep1Component {
  profileImage: string = '';
  uploading: boolean = false;
  uploadError: string = '';

  constructor(private router: Router, private regService: DoctorRegistrationService) {
    const data = this.regService.getAllData();
    this.profileImage = data.profileImage || '';
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

  nextStep() {
    this.regService.setStepData({ profileImage: this.profileImage });
    this.router.navigate(['/doctors/register/doctor-register-step2']);
  }
}
