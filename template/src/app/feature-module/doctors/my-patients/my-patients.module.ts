import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyPatientsRoutingModule } from './my-patients-routing.module';
import { MyPatientsComponent } from './my-patients.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeatureModuleModule } from '../../feature-module.module';


@NgModule({
  declarations: [
    MyPatientsComponent
  ],
  imports: [
    CommonModule,
    MyPatientsRoutingModule,
    SharedModule,
    FeatureModuleModule
  ]
})
export class MyPatientsModule { }
