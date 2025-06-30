import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PharmacyDetailsRoutingModule } from './pharmacy-details-routing.module';
import { PharmacyDetailsComponent } from './pharmacy-details.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    PharmacyDetailsComponent
  ],
  imports: [
    CommonModule,
    PharmacyDetailsRoutingModule,
    SharedModule
  ]
})
export class PharmacyDetailsModule { }
