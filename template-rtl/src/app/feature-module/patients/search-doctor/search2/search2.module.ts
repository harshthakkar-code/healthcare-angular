import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Search2RoutingModule } from './search2-routing.module';
import { Search2Component } from './search2.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    Search2Component
  ],
  imports: [
    CommonModule,
    Search2RoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class Search2Module { }
