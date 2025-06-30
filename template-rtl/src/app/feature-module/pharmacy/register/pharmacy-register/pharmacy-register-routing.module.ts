import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyRegisterComponent } from './pharmacy-register.component';

const routes: Routes = [{ path: '', component: PharmacyRegisterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacyRegisterRoutingModule { }
