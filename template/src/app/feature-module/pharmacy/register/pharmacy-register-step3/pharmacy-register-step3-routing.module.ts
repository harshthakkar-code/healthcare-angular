import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyRegisterStep3Component } from './pharmacy-register-step3.component';

const routes: Routes = [{ path: '', component: PharmacyRegisterStep3Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacyRegisterStep3RoutingModule { }
