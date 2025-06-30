import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PharmacyRegisterStep2RoutingModule } from './pharmacy-register-step2-routing.module';
import { PharmacyRegisterStep2Component } from './pharmacy-register-step2.component';


@NgModule({
  declarations: [
    PharmacyRegisterStep2Component
  ],
  imports: [
    CommonModule,
    PharmacyRegisterStep2RoutingModule
  ]
})
export class PharmacyRegisterStep2Module { }
