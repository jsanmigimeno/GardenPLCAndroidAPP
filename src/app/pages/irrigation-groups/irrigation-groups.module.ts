import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IrrigationGroupsPageRoutingModule } from './irrigation-groups-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { IrrigationGroupsPage } from './irrigation-groups.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IrrigationGroupsPageRoutingModule,
    SharedModule
  ],
  declarations: [IrrigationGroupsPage]
})
export class IrrigationGroupsPageModule {}
