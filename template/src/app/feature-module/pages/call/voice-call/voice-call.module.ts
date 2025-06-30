import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VoiceCallRoutingModule } from './voice-call-routing.module';
import { VoiceCallComponent } from './voice-call.component';
import { materialModule } from 'src/app/shared/material.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    VoiceCallComponent
  ],
  imports: [
    CommonModule,
    VoiceCallRoutingModule,
    materialModule,
    SharedModule
  ]
})
export class VoiceCallModule { }
