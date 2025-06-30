import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyRegisterStep2Component } from './pharmacy-register-step2.component';

const routes: Routes = [{ path: '', component: PharmacyRegisterStep2Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacyRegisterStep2RoutingModule { }
