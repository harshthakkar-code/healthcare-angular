import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthRegisterRoutingModule } from './auth-register-routing.module';
import { AuthRegisterComponent } from './auth-register.component';
import { RegistrationSuccessComponent } from './registration-success.component';


@NgModule({
  declarations: [
    AuthRegisterComponent,
    
  ],
  imports: [
    CommonModule,
    AuthRegisterRoutingModule,
    FormsModule,RegistrationSuccessComponent
  ]
})
export class AuthRegisterModule { }
