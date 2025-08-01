import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorProfile1RoutingModule } from './doctor-profile1-routing.module';
import { DoctorProfile1Component } from './doctor-profile1.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeatureModuleModule } from '../../../feature-module.module';


@NgModule({
  declarations: [
    DoctorProfile1Component
  ],
  imports: [
    CommonModule,
    DoctorProfile1RoutingModule,
    SharedModule,
    FeatureModuleModule
    
  ]
})
export class DoctorProfile1Module { }
