import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HospitalsRoutingModule } from './hospitals-routing.module';
import { HospitalsComponent } from './hospitals.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    HospitalsComponent
  ],
  imports: [
    CommonModule,
    HospitalsRoutingModule,
    SharedModule
  ]
})
export class HospitalsModule { }
