import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralHomeRoutingModule } from './general-home-routing.module';
import { GeneralHomeComponent } from './general-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    GeneralHomeComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    GeneralHomeRoutingModule,
    SharedModule
  ]
})
export class GeneralHomeModule { }
