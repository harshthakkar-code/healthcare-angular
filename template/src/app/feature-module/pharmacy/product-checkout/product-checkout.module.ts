import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductCheckoutRoutingModule } from './product-checkout-routing.module';
import { ProductCheckoutComponent } from './product-checkout.component';


@NgModule({
  declarations: [
    ProductCheckoutComponent
  ],
  imports: [
    CommonModule,
    ProductCheckoutRoutingModule
  ]
})
export class ProductCheckoutModule { }
