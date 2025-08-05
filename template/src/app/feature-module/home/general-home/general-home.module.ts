import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralHomeRoutingModule } from './general-home-routing.module';
import { GeneralHomeComponent } from './general-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { FeatureModuleModule } from '../../feature-module.module';

@NgModule({
  declarations: [
    GeneralHomeComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    GeneralHomeRoutingModule,
    SharedModule,
    FeatureModuleModule
  ]
})
export class GeneralHomeModule { }
