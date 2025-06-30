import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductDescriptionRoutingModule } from './product-description-routing.module';
import { ProductDescriptionComponent } from './product-description.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ProductDescriptionComponent
  ],
  imports: [
    CommonModule,
    ProductDescriptionRoutingModule,
    SharedModule
  ]
})
export class ProductDescriptionModule { }
