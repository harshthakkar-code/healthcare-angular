import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from './common/empty-state/empty-state.component'

import { FeatureModuleRoutingModule } from './feature-module-routing.module';
import { FeatureModuleComponent } from './feature-module.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AvatarComponent } from './common/avatar/avatar.component';

@NgModule({
  declarations: [
    FeatureModuleComponent,
    HeaderComponent,
    FooterComponent,
    EmptyStateComponent,
    AvatarComponent
  ],
  imports: [
    CommonModule,FormsModule,SharedModule,
    FeatureModuleRoutingModule
  ],
  exports: [
    EmptyStateComponent,
    AvatarComponent
  ]
})
export class FeatureModuleModule { }
