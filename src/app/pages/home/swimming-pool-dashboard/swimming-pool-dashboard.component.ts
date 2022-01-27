import { Component, ViewChild } from '@angular/core';

import { GlobalHandlerService } from 'src/app/services/global-handler.service';
import { SwimmingPoolHandlerService, SwimmingPoolControllerState } from 'src/app/services/swimming-pool-handler.service';
import { DatetimeSelectorComponent } from 'src/app/shared/datetime-selector/datetime-selector.component';
import { SelectComponent } from 'src/app/shared/select/select.component';
import { formatDuration, getDateText } from 'src/app/utils/utils';
import { swimmingPoolPeriodOptions } from 'src/app/definitions/swimming-pool-definitions';
import { getUnixTime, parseISO, formatISO } from 'date-fns';


@Component({
  selector: 'app-swimming-pool-dashboard',
  template: `
    <div id="main-content" *ngIf="spHandler.state$ | async as state; else loading">
      <h3 class="section-title">Piscina</h3>
      <h4 class="section-title state">
        Estado: <span [class.on]="state.pump">
          {{isStateIdle(state.state) ? 'Inactivo' : (isStateManual(state.state) ? 'Arranque Manual' : 'Arranque Automático')}}
        </span>
      </h4>
      <app-notification id="manual-disabled-notification" *ngIf="state.manualDisable">
        El arranque manual esta deshabilitado hasta que se desactive manualmente desde el cuadro de control.
      </app-notification>
      <div id="state-overview-container">
        <app-large-state-widget [state]="state.pump" [name]="'Bomba'"></app-large-state-widget>
        <app-large-state-widget [state]="state.uv" [name]="'UV-C'"></app-large-state-widget>
      </div>
      <app-list-item [disableRipple]="true" >
        UV
        <span slot="value">{{ state.uvEnable ? 'Habilitado' : 'Deshabilitado' }}</span>
      </app-list-item>
      <app-list-item (click)="toggleSchedule()">
        Programación Activa
        <span slot="value">
          <ion-toggle [checked]="state.scheduleEnable"></ion-toggle>
        </span>
      </app-list-item>
      <app-list-item (click)="setNextSchedule()">
        Siguiente Arranque
        <span slot="value">{{ getDateText(state.nextSchedule) }}</span>
        <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
      </app-list-item>
      <app-list-item (click)="setDuration()">
        Duración
        <span slot="value">{{ formatDuration(state.scheduleDuration) }}</span>
        <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
      </app-list-item>
      <app-list-item (click)="setPeriod()">
        Periodo
        <span slot="value">{{ formatPeriod(state.schedulePeriod) }}</span>
        <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
      </app-list-item>
    </div>
    <ng-template #loading>
      <div id="loading">
        <ion-spinner></ion-spinner>
      </div>
    </ng-template>
    <app-select></app-select>
    <app-datetime-selector></app-datetime-selector>
  `,
  styles: [`
    :host {
      display: block;
    }

    #loading {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #manual-disabled-notification {
      margin-top: 20px;
    }

    #state-overview-container {
      display: flex;
      justify-content: space-between;

      app-large-state-widget {
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 0;
      }
    }
  `],
})
export class SwimmingPoolDashboardComponent {
  @ViewChild(DatetimeSelectorComponent) datetimeSelector : DatetimeSelectorComponent;
  @ViewChild(SelectComponent)           selectComponent  : SelectComponent;

  constructor(
    public globalHandler : GlobalHandlerService,
    public spHandler     : SwimmingPoolHandlerService
  ) {}

  isStateIdle(state: SwimmingPoolControllerState): boolean {
    return state === SwimmingPoolControllerState.idle;
  }

  isStateManual(state: SwimmingPoolControllerState): boolean {
    return state === SwimmingPoolControllerState.manual;
  }

  isStateAuto(state: SwimmingPoolControllerState): boolean {
    return state === SwimmingPoolControllerState.auto;
  }

  getDateText(timestamp: number): string {
    return getDateText(timestamp);
  }

  formatDuration(duration: number): string {
    return formatDuration(duration);
  }

  formatPeriod(period: number): string {
    return period.toFixed(0) + (period === 1 ? ' Dia' : ' Dias');
  }

  intToPaddedStr(val: number, padLength: number): string {
    return val.toString().padStart(padLength, '0');
  }



  // Config Functions

  async toggleSchedule(): Promise<void> {
    this.spHandler.toggleScheduleEnable();
  }

  async setNextSchedule(): Promise<void> {
    const newTimeISO = await this.datetimeSelector.select(
      formatISO(this.spHandler.state.nextSchedule*1000),
      formatISO(this.globalHandler.clock$.getValue()*1000),
      '2099',
      'Selecciona la Fecha y Hora del Próximo Filtrado'
    );

    if (newTimeISO !== undefined) this.spHandler.setNextSchedule(getUnixTime(parseISO(newTimeISO)));
  }

  async setDuration(): Promise<void> {
    // TODO     THIS IMPLEMENTATION CURRENTLY USES IONIC'S DATE TIME PICKER
    // TODO     SINCE IT DOES NOT CONTAIN FUNCTIONALITY TO SELECT A MM:SS VALUE, THE HH:MM IS USED INSTEAD
    // TODO     HENCE, MAXIMUM 24min OF IRRIGATION CAN BE SELECTED
    // TODO     FIX.

    const currentDuration = this.spHandler.state.scheduleDuration;
    const currentHours    = Math.floor(currentDuration/60);
    const currentMinutes  = currentDuration - currentHours*60;

    const newTimeString = await this.datetimeSelector.selectTime(
      `${currentHours.toFixed(0).padStart(2, '0')}:${currentMinutes.toFixed(0).padStart(2, '0')}`,
      'Selecciona la Duración del Filtrado'
    );
    if (newTimeString === undefined) return;

    const newHours   = parseInt(newTimeString.substring(0, 2), 10);
    const newMinutes = parseInt(newTimeString.substring(3, 5), 10);

    const newTimeInMinutes = newHours*60 + newMinutes;
    this.spHandler.setDuration(newTimeInMinutes);
  }

  async setPeriod(): Promise<void> {
    const newPeriod = await this.selectComponent.select(
      this.spHandler.state.schedulePeriod,
      swimmingPoolPeriodOptions,
      'Selecciona el Periodo de Filtrado'
    );
    if (newPeriod !== undefined) this.spHandler.setPeriod(newPeriod);
  }
}
