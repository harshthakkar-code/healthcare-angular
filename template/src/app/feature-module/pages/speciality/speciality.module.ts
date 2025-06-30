import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpecialityRoutingModule } from './speciality-routing.module';
import { SpecialityComponent } from './speciality.component';


@NgModule({
  declarations: [
    SpecialityComponent
  ],
  imports: [
    CommonModule,
    SpecialityRoutingModule
  ]
})
export class SpecialityModule { }
