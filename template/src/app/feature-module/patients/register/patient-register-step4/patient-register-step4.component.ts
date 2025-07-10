import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PatientRegistrationService } from '../patient-registration.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { uploadImage } from 'src/app/shared/api/image-upload';
@Component({
    selector: 'app-patient-register-step4',
    templateUrl: './patient-register-step4.component.html',
    styleUrls: ['./patient-register-step4.component.scss'],
    standalone: true,
    imports: [FormsModule, RouterModule]
})
export class PatientRegisterStep4Component {
  public routes = routes;

  child1Age: string = '';
  child1Image: string = '';
  spouseAge: string = '';
  spouseImage: string = '';
  fatherAge: string = '';
  fatherImage: string = '';
  motherAge: string = '';
  motherImage: string = '';

  constructor(private patientRegService: PatientRegistrationService, private router: Router) {
    const data = this.patientRegService.getAllData();
    this.child1Age = data['child1Age'] || '';
    this.child1Image = data['child1Image'] || '';
    this.spouseAge = data['spouseAge'] || '';
    this.spouseImage = data['spouseImage'] || '';
    this.fatherAge = data['fatherAge'] || '';
    this.fatherImage = data['fatherImage'] || '';
    this.motherAge = data['motherAge'] || '';
    this.motherImage = data['motherImage'] || '';
  }

  async onImageSelected(event: any, field: string) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      switch (field) {
        case 'child1Image':
          this.child1Image = url;
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
      this.patientRegService.setStepData({ [field]: url });
    } catch (err) {
      console.error('Image upload failed', err);
    }
  }

  continue() {
    this.patientRegService.setStepData({
      child1Age: this.child1Age,
      child1Image: this.child1Image,
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
