import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PharmacyIndexRoutingModule } from './pharmacy-index-routing.module';
import { PharmacyIndexComponent } from './pharmacy-index.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PharmacyheaderComponent } from '../../common/pharmacyheader/pharmacyheader.component';
import { PharmacyfooterComponent } from '../../common/pharmacyfooter/pharmacyfooter.component';

@NgModule({
  declarations: [
    PharmacyIndexComponent,
    PharmacyheaderComponent,
    PharmacyfooterComponent,
  ],
  imports: [CommonModule, PharmacyIndexRoutingModule, SharedModule],
})
export class PharmacyIndexModule {}
