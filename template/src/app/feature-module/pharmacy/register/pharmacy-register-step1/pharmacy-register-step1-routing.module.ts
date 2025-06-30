import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyRegisterStep1Component } from './pharmacy-register-step1.component';

const routes: Routes = [{ path: '', component: PharmacyRegisterStep1Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacyRegisterStep1RoutingModule { }
