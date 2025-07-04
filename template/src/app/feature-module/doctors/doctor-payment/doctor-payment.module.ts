import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorPaymentRoutingModule } from './doctor-payment-routing.module';
import { DoctorPaymentComponent } from './doctor-payment.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeatureModuleModule } from '../../feature-module.module';


@NgModule({
  declarations: [
    DoctorPaymentComponent
  ],
  imports: [
    CommonModule,
    DoctorPaymentRoutingModule,
    SharedModule,
    FeatureModuleModule
  ]
})
export class DoctorPaymentModule { }
