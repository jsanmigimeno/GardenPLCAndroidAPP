import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IrrigationGroupPage } from './irrigation-group.page';

const routes: Routes = [
  {
    path     : '',
    component: IrrigationGroupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IrrigationGroupPageRoutingModule {}
