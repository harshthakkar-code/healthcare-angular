import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorSignupRoutingModule } from './doctor-signup-routing.module';
import { DoctorSignupComponent } from './doctor-signup.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    DoctorSignupComponent
  ],
  imports: [
    CommonModule,
    DoctorSignupRoutingModule,
    SharedModule
  ]
})
export class DoctorSignupModule { }
