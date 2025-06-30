import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductAllRoutingModule } from './product-all-routing.module';
import { ProductAllComponent } from './product-all.component';


@NgModule({
  declarations: [
    ProductAllComponent
  ],
  imports: [
    CommonModule,
    ProductAllRoutingModule
  ]
})
export class ProductAllModule { }
