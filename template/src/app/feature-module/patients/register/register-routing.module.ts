import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register.component';

const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    children: [
      {
        path: 'patient-register-step1',
        loadComponent: () => import('./patient-register-step1/patient-register-step1.component').then(m => m.PatientRegisterStep1Component)
      },
      {
        path: 'patient-register-step2',
        loadComponent: () => import('./patient-register-step2/patient-register-step2.component').then(m => m.PatientRegisterStep2Component)
      },
      {
        path: 'patient-register-step3',
        loadComponent: () => import('./patient-register-step3/patient-register-step3.component').then(m => m.PatientRegisterStep3Component)
      },
      {
        path: 'patient-register-step4',
        loadComponent: () => import('./patient-register-step4/patient-register-step4.component').then(m => m.PatientRegisterStep4Component)
      },
      {
        path: 'patient-register-step5',
        loadComponent: () => import('./patient-register-step5/patient-register-step5.component').then(m => m.PatientRegisterStep5Component)
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterRoutingModule {}
