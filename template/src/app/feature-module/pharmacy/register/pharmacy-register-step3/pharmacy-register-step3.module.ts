import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PharmacyRegisterStep3RoutingModule } from './pharmacy-register-step3-routing.module';
import { PharmacyRegisterStep3Component } from './pharmacy-register-step3.component';


@NgModule({
  declarations: [
    PharmacyRegisterStep3Component
  ],
  imports: [
    CommonModule,
    PharmacyRegisterStep3RoutingModule
  ]
})
export class PharmacyRegisterStep3Module { }
