import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginPhoneOtpRoutingModule } from './login-phone-otp-routing.module';
import { LoginPhoneOtpComponent } from './login-phone-otp.component';


@NgModule({
  declarations: [
    LoginPhoneOtpComponent
  ],
  imports: [
    CommonModule,
    LoginPhoneOtpRoutingModule
  ]
})
export class LoginPhoneOtpModule { }
