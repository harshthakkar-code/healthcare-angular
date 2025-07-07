import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientsRoutingModule } from './patients-routing.module';
import { PatientsComponent } from './patients.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientInvoiceComponent } from './patient-invoice/patient-invoice.component';
import { FeatureModuleModule } from '../feature-module.module';


@NgModule({
  declarations: [
    PatientsComponent,
    PatientInvoiceComponent,
  ],
  imports: [
    CommonModule,
    PatientsRoutingModule,
    SharedModule,
    FeatureModuleModule
  ]
})
export class PatientsModule { }
