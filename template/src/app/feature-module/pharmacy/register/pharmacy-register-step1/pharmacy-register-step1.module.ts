import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PharmacyRegisterStep1RoutingModule } from './pharmacy-register-step1-routing.module';
import { PharmacyRegisterStep1Component } from './pharmacy-register-step1.component';


@NgModule({
  declarations: [
    PharmacyRegisterStep1Component
  ],
  imports: [
    CommonModule,
    PharmacyRegisterStep1RoutingModule
  ]
})
export class PharmacyRegisterStep1Module { }
