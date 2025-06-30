import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PharmacySearchRoutingModule } from './pharmacy-search-routing.module';
import { PharmacySearchComponent } from './pharmacy-search.component';


@NgModule({
  declarations: [
    PharmacySearchComponent
  ],
  imports: [
    CommonModule,
    PharmacySearchRoutingModule
  ]
})
export class PharmacySearchModule { }
