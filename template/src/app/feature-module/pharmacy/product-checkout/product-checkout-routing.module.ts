import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductCheckoutComponent } from './product-checkout.component';

const routes: Routes = [{ path: '', component: ProductCheckoutComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductCheckoutRoutingModule { }
