import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyDetailsComponent } from './pharmacy-details.component';

const routes: Routes = [{ path: '', component: PharmacyDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacyDetailsRoutingModule { }
