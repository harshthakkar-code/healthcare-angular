import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DependentRoutingModule } from './dependent-routing.module';
import { DependentComponent } from './dependent.component';
import { FeatureModuleModule } from '../../feature-module.module';

@NgModule({
  declarations: [
    DependentComponent
  ],
  imports: [
    CommonModule,
    DependentRoutingModule,
    FeatureModuleModule
  ]
})
export class DependentModule { }
