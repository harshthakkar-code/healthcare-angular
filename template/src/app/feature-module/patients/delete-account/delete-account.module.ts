import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeleteAccountRoutingModule } from './delete-account-routing.module';
import { DeleteAccountComponent } from './delete-account.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    DeleteAccountComponent
  ],
  imports: [
    CommonModule,
    DeleteAccountRoutingModule,
    SharedModule
  ]
})
export class DeleteAccountModule { }
