import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthRegisterComponent } from './auth-register.component';

const routes: Routes = [{ path: '', component: AuthRegisterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRegisterRoutingModule { }
