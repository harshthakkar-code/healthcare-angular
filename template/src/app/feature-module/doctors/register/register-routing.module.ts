import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register.component';

const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    children: [
      {
        path: 'doctor-register',
        loadComponent: () => import('./doctor-register/doctor-register.component').then(m => m.DoctorRegisterComponent)
      },
      {
        path: 'doctor-register-step1',
        loadComponent: () => import('./doctor-register-step1/doctor-register-step1.component').then(m => m.DoctorRegisterStep1Component)
      },
      {
        path: 'doctor-register-step2',
        loadComponent: () => import('./doctor-register-step2/doctor-register-step2.component').then(m => m.DoctorRegisterStep2Component)
      },
      {
        path: 'doctor-register-step3',
        loadComponent: () => import('./doctor-register-step3/doctor-register-step3.component').then(m => m.DoctorRegisterStep3Component)
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterRoutingModule {}
