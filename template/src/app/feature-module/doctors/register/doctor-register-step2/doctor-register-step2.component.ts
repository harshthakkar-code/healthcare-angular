import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorRegistrationService } from '../doctor-registration.service';
import { uploadImage } from 'src/app/shared/api/image-upload';

@Component({
  selector: 'app-doctor-register-step2',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-register-step2.component.html',
  styleUrls: ['./doctor-register-step2.component.scss']
})
export class DoctorRegisterStep2Component {
  gender = '';
  isRegistered = false;
  registerYears = '';
  address = '';
  address2 = '';
  pincode = '';
  clinicAddress = '';
  qualiCertificate: string = '';
  photoId: string = '';
  clinicalEmployment: string = '';
  weight: string = '';
  weightUnit: string = 'kg';
  height: string = '';
  heightUnit: string = 'cm';
  age: string = '';
  blood: string = '';
  bio = '';
  specialization = '';
  experience: string = '';
  services: string[] = [];

  displayStyle: string = 'none';

  uploading: { [key: string]: boolean } = {};
  uploadError: { [key: string]: string } = {};

  genderError = '';
  addressError = '';
  pincodeError = '';
  clinicAddressError = '';
  qualiCertificateError = '';
  photoIdError = '';
  clinicalEmploymentError = '';
  weightError = '';
  heightError = '';
  ageError = '';
  bloodError = '';
  registerYearsError = '';

  constructor(private router: Router, private regService: DoctorRegistrationService) {
    const data = this.regService.getAllData();
    this.gender = data.gender || '';
    this.isRegistered = data.isRegistered || false;
    this.registerYears = data.registerYears || '';
    this.address = data.address || '';
    this.address2 = data.address2 || '';
    this.pincode = data.pincode || '';
    this.clinicAddress = data.clinicAddress || '';
    this.qualiCertificate = data.qualiCertificate || '';
    this.photoId = data.photoId || '';
    this.clinicalEmployment = data.clinicalEmployment || '';
    this.weight = data.weight || '';
    this.weightUnit = data.weightUnit || 'kg';
    this.height = data.height || '';
    this.heightUnit = data.heightUnit || 'cm';
    this.age = data.age || '';
    this.blood = data.blood || '';
    this.bio = data.bio || '';
    this.specialization = data.specialization || '';
    this.experience = data.experience || '';
    this.services = data.services || [];
  }

  toggleDisplay() {
    this.displayStyle = this.displayStyle === 'none' ? 'block' : 'none';
  }

  async onFileSelected(event: any, field: 'qualiCertificate' | 'photoId' | 'clinicalEmployment') {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError[field] = 'Only JPG and PNG images are allowed.';
      return;
    }
    this.uploadError[field] = '';
    this.uploading[field] = true;
    try {
      const url = await uploadImage(file);
      this[field] = url;
    } catch (err) {
      this.uploadError[field] = 'Upload failed. Please try again.';
    }
    this.uploading[field] = false;
  }

  removeFile(field: 'qualiCertificate' | 'photoId' | 'clinicalEmployment') {
    this[field] = '';
  }

  nextStep() {
    console.log('Next step called');
    // Reset errors
    this.genderError = '';
    this.addressError = '';
    this.pincodeError = '';
    this.clinicAddressError = '';
    this.qualiCertificateError = '';
    this.photoIdError = '';
    this.clinicalEmploymentError = '';
    this.weightError = '';
    this.heightError = '';
    this.ageError = '';
    this.bloodError = '';
    this.registerYearsError = '';

    let valid = true;

    if (!this.gender) {
      this.genderError = 'Gender is required';
      valid = false;
    }
    // if (!this.address.trim()) {
    //   this.addressError = 'Address is required';
    //   valid = false;
    // }
    if (!this.pincode.trim()) {
      this.pincodeError = 'Pincode is required';
      valid = false;
    }
    if (!this.clinicAddress.trim()) {
      this.clinicAddressError = 'Clinic address is required';
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
    if (this.isRegistered && !this.registerYears) {
      this.registerYearsError = 'Please select years of being registered';
      valid = false;
    }

    if (!valid) {
      console.log('Validation failed', {
        gender: this.gender,
        // address: this.address,
        pincode: this.pincode,
        clinicAddress: this.clinicAddress,
        weight: this.weight,
        height: this.height,
        age: this.age,
        blood: this.blood,
        registerYears: this.registerYears,
        isRegistered: this.isRegistered
      });
      return;
    }

    // Save and navigate if valid
    this.regService.setStepData({
      gender: this.gender,
      isRegistered: this.isRegistered,
      registerYears: this.registerYears,
      address: this.address,
      address2: this.address2,
      pincode: this.pincode,
      clinicAddress: this.clinicAddress,
      qualiCertificate: this.qualiCertificate,
      photoId: this.photoId,
      clinicalEmployment: this.clinicalEmployment,
      weight: this.weight,
      weightUnit: this.weightUnit,
      height: this.height,
      heightUnit: this.heightUnit,
      age: this.age,
      blood: this.blood,
      bio: this.bio,
      specialization: this.specialization,
      experience: this.experience,
      services: this.services
    });
    this.router.navigate(['/doctors/register/doctor-register-step3']);
  }
}
