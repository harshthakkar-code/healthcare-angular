import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingPopupComponent } from './booking-popup.component';

const routes: Routes = [{ path: '', component: BookingPopupComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingPopupRoutingModule { }
