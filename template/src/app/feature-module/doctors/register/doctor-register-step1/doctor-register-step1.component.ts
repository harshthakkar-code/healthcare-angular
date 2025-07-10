import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorRegistrationService } from '../doctor-registration.service';

@Component({
  selector: 'app-doctor-register-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-register-step1.component.html',
  styleUrls: ['./doctor-register-step1.component.scss']
})
export class DoctorRegisterStep1Component {
  profileImage: string = '';

  constructor(private router: Router, private regService: DoctorRegistrationService) {
    const data = this.regService.getAllData();
    this.profileImage = data.profileImage || '';
  }

  onProfileImageChange(image: string) {
    this.profileImage = image;
  }

  nextStep() {
    this.regService.setStepData({ profileImage: this.profileImage });
    this.router.navigate(['/doctors/register/doctor-register-step2']);
  }
}
