import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FavouritesRoutingModule } from './favourites-routing.module';
import { FavouritesComponent } from './favourites.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeatureModuleModule } from '../../feature-module.module';



@NgModule({
  declarations: [
    FavouritesComponent
  ],
  imports: [
    CommonModule,
    FavouritesRoutingModule,
    SharedModule,
    FeatureModuleModule
  ]
})
export class FavouritesModule { }
