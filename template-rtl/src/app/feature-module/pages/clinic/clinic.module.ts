import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicRoutingModule } from './clinic-routing.module';
import { ClinicComponent } from './clinic.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ClinicComponent
  ],
  imports: [
    CommonModule,
    ClinicRoutingModule,
    SharedModule
  ]
})
export class ClinicModule { }
