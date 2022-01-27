import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DatetimeSelectorComponent, DatetimeSelectorModalComponent } from './datetime-selector/datetime-selector.component';
import { ListHeaderComponent } from './list-item/list-header.component';
import { ListItemComponent } from './list-item/list-item.component';
import { SelectComponent } from './select/select.component';
import { NextIrrigationWidgetComponent } from './next-irrigation-widget/next-irrigation-widget.component';
import { NotificationComponent } from './notification/notification.component';
import { TextInputAlertComponent, TextInputAlertModalComponent } from './text-input-alert/text-input-alert.component';
import { BackButtonComponent } from './back-button/back-button.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    ListHeaderComponent,
    ListItemComponent,
    DatetimeSelectorComponent,
    DatetimeSelectorModalComponent,
    SelectComponent,
    BackButtonComponent,
    TextInputAlertComponent,
    TextInputAlertModalComponent,
    NotificationComponent,
    NextIrrigationWidgetComponent
  ],
  exports: [
    ListHeaderComponent,
    ListItemComponent,
    DatetimeSelectorComponent,
    DatetimeSelectorModalComponent,
    SelectComponent,
    BackButtonComponent,
    TextInputAlertComponent,
    NotificationComponent,
    NextIrrigationWidgetComponent
  ]
})
export class SharedModule { }
