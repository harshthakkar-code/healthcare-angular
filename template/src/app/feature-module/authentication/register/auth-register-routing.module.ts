import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthRegisterComponent } from './auth-register.component';

const routes: Routes = [
  { path: '', component: AuthRegisterComponent },
  {
    path: 'registration-success',
    loadComponent: () => import('./registration-success.component').then(m => m.RegistrationSuccessComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRegisterRoutingModule { }
