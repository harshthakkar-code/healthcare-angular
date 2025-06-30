import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorGridRoutingModule } from './doctor-grid-routing.module';
import { DoctorGridComponent } from './doctor-grid.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    DoctorGridComponent
  ],
  imports: [
    CommonModule,
    DoctorGridRoutingModule,
    SharedModule
  ]
})
export class DoctorGridModule { }
