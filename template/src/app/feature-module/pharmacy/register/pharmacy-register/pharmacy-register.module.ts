import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PharmacyRegisterRoutingModule } from './pharmacy-register-routing.module';
import { PharmacyRegisterComponent } from './pharmacy-register.component';


@NgModule({
  declarations: [
    PharmacyRegisterComponent
  ],
  imports: [
    CommonModule,
    PharmacyRegisterRoutingModule
  ]
})
export class PharmacyRegisterModule { }
