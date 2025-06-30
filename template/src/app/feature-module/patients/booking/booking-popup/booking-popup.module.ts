import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingPopupRoutingModule } from './booking-popup-routing.module';
import { BookingPopupComponent } from './booking-popup.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    BookingPopupComponent
  ],
  imports: [
    CommonModule,
    BookingPopupRoutingModule,
    SharedModule
  ]
})
export class BookingPopupModule { }
