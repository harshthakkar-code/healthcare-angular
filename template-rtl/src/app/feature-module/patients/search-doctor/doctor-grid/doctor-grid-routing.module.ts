import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorGridComponent } from './doctor-grid.component';

const routes: Routes = [{ path: '', component: DoctorGridComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorGridRoutingModule { }
