import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorProfile2RoutingModule } from './doctor-profile2-routing.module';
import { DoctorProfile2Component } from './doctor-profile2.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeatureModuleModule } from '../../../feature-module.module';


@NgModule({
  declarations: [
    DoctorProfile2Component
  ],
  imports: [
    CommonModule,
    DoctorProfile2RoutingModule,
    SharedModule,
    FeatureModuleModule
  ]
})
export class DoctorProfile2Module { }
