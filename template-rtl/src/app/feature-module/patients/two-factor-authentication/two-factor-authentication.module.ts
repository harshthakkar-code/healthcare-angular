import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TwoFactorAuthenticationRoutingModule } from './two-factor-authentication-routing.module';
import { TwoFactorAuthenticationComponent } from './two-factor-authentication.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    TwoFactorAuthenticationComponent
  ],
  imports: [
    CommonModule,
    TwoFactorAuthenticationRoutingModule,
    SharedModule
  ]
})
export class TwoFactorAuthenticationModule { }
