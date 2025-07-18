import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorRegisterComponent } from './doctor-register.component';

const routes: Routes = [
  { path: '', component: DoctorRegisterComponent },
  {
    path: 'registration-success',
    loadComponent: () => import('src/app/feature-module/authentication/register/registration-success.component').then(m => m.RegistrationSuccessComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRegisterRoutingModule { }
