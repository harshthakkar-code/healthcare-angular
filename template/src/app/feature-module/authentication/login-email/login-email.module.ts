import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoginEmailRoutingModule } from './login-email-routing.module';
import { LoginEmailComponent } from './login-email.component';


@NgModule({
  declarations: [
    LoginEmailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LoginEmailRoutingModule
  ]
})
export class LoginEmailModule { }
