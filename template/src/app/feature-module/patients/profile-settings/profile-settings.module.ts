import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileSettingsRoutingModule } from './profile-settings-routing.module';
import { ProfileSettingsComponent } from './profile-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeatureModuleModule } from '../../feature-module.module';


@NgModule({
  declarations: [
    ProfileSettingsComponent
  ],
  imports: [
    CommonModule,
    ProfileSettingsRoutingModule,
    SharedModule,
    FeatureModuleModule
  ]
})
export class ProfileSettingsModule { }
