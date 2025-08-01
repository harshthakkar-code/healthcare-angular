import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorProfileRoutingModule } from './doctor-profile-routing.module';
import { DoctorProfileComponent } from './doctor-profile.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeatureModuleModule } from '../../feature-module.module';


@NgModule({
  declarations: [
    DoctorProfileComponent,
    
  ],
  imports: [
    CommonModule,
    DoctorProfileRoutingModule,
    SharedModule,
    FeatureModuleModule
  ]
})
export class DoctorProfileModule { }
