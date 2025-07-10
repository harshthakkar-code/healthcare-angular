import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthRegisterRoutingModule } from './auth-register-routing.module';
import { AuthRegisterComponent } from './auth-register.component';


@NgModule({
  declarations: [
    AuthRegisterComponent
  ],
  imports: [
    CommonModule,
    AuthRegisterRoutingModule,
    FormsModule
  ]
})
export class AuthRegisterModule { }
