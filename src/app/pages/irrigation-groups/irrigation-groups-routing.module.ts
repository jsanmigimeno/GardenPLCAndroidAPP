import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IrrigationGroupsPage } from './irrigation-groups.page';

const routes: Routes = [
  {
    path     : '',
    component: IrrigationGroupsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IrrigationGroupsPageRoutingModule {}
