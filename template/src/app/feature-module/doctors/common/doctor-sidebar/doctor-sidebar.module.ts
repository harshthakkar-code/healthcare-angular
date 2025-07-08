import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorSidebarComponent } from '../doctor-sidebar/doctor-sidebar.component';
import {MatSelectModule} from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [DoctorSidebarComponent],
  imports: [CommonModule, MatSelectModule, RouterModule, FormsModule],
  exports: [DoctorSidebarComponent],
})
export class DoctorSidebarModule {}
