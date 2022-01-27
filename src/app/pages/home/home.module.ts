import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';

import { ClockComponent } from './clock/clock.component';
import { IrrigationDashboardComponent } from './irrigation-dashboard/irrigation-dashboard.component';
import { LargeStateWidgetComponent } from './large-state-widget/large-state-widget.component';
import { SwimmingPoolDashboardComponent } from './swimming-pool-dashboard/swimming-pool-dashboard.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SharedModule
  ],
  declarations: [
    HomePage,
    SwimmingPoolDashboardComponent,
    IrrigationDashboardComponent,
    LargeStateWidgetComponent,
    ClockComponent
  ]
})
export class HomePageModule {}
