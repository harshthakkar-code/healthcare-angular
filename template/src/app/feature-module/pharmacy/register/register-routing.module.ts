import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register.component';

const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    children: [
      {
        path: 'pharmacy-register-step3',
        loadChildren: () =>
          import(
            './pharmacy-register-step3/pharmacy-register-step3.module'
          ).then((m) => m.PharmacyRegisterStep3Module),
      },
      {
        path: 'pharmacy-register-step2',
        loadChildren: () =>
          import(
            './pharmacy-register-step2/pharmacy-register-step2.module'
          ).then((m) => m.PharmacyRegisterStep2Module),
      },
      {
        path: 'pharmacy-register-step1',
        loadChildren: () =>
          import(
            './pharmacy-register-step1/pharmacy-register-step1.module'
          ).then((m) => m.PharmacyRegisterStep1Module),
      },
      {
        path: 'pharmacy-register',
        loadChildren: () =>
          import('./pharmacy-register/pharmacy-register.module').then(
            (m) => m.PharmacyRegisterModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterRoutingModule {}
