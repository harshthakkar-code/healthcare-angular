import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapListAvailabilityRoutingModule } from './map-list-availability-routing.module';
import { MapListAvailabilityComponent } from './map-list-availability.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    MapListAvailabilityComponent
  ],
  imports: [
    CommonModule,
    MapListAvailabilityRoutingModule,
    SharedModule
  ]
})
export class MapListAvailabilityModule { }
