import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralHomeComponent } from './general-home.component';

const routes: Routes = [{ path: '', component: GeneralHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralHomeRoutingModule { }
