import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapListAvailabilityComponent } from './map-list-availability.component';

const routes: Routes = [{ path: '', component: MapListAvailabilityComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapListAvailabilityRoutingModule { }
