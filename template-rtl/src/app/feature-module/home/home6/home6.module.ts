import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Home6RoutingModule } from './home6-routing.module';
import { Home6Component } from './home6.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    Home6Component,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    Home6RoutingModule,
    SharedModule,
    FormsModule,
    CalendarModule
  ]
})
export class Home6Module { }
