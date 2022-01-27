import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { IrrigationGroupPageRoutingModule } from './irrigation-group-routing.module';
import { IrrigationGroupPage } from './irrigation-group.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IrrigationGroupPageRoutingModule,
    SharedModule
  ],
  declarations: [IrrigationGroupPage]
})
export class IrrigationGroupPageModule {}
