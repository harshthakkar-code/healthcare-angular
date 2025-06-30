import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyComponent } from './pharmacy.component';

const routes: Routes = [
  {
    path: '',
    component: PharmacyComponent,
    children: [
      {
        path: 'pharmacy-index',
        loadChildren: () =>
          import('./pharmacy-index/pharmacy-index.module').then(
            (m) => m.PharmacyIndexModule
          ),
      },
      {
        path: 'pharmacy-details',
        loadChildren: () =>
          import('./pharmacy-details/pharmacy-details.module').then(
            (m) => m.PharmacyDetailsModule
          ),
      },
      {
        path: 'pharmacy-search',
        loadChildren: () =>
          import('./pharmacy-search/pharmacy-search.module').then(
            (m) => m.PharmacySearchModule
          ),
      },
      {
        path: 'product-all',
        loadChildren: () =>
          import('./product-all/product-all.module').then(
            (m) => m.ProductAllModule
          ),
      },
      {
        path: 'product-description',
        loadChildren: () =>
          import('./product-description/product-description.module').then(
            (m) => m.ProductDescriptionModule
          ),
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('./cart/cart.module').then((m) => m.CartModule),
      },
      {
        path: 'product-checkout',
        loadChildren: () =>
          import('./product-checkout/product-checkout.module').then(
            (m) => m.ProductCheckoutModule
          ),
      },
      {
        path: 'payment-success',
        loadChildren: () =>
          import('./payment-success/payment-success.module').then(
            (m) => m.PaymentSuccessModule
          ),
      },
      {
        path: 'register',
        loadChildren: () =>
          import('./register/register.module').then((m) => m.RegisterModule),
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PharmacyRoutingModule {}
