import { arrayToZonesInt } from './../../../utils/utils';
import { Component, ViewChild } from '@angular/core';
import { fromUnixTime, getUnixTime, parseISO } from 'date-fns';

import { GlobalHandlerService } from 'src/app/services/global-handler.service';
import { IrrigationHandlerService, IrrigationControllerState } from 'src/app/services/irrigation-handler.service';
import { SelectItem } from 'src/app/shared/select/select.component';
import { SelectComponent } from 'src/app/shared/select/select.component';
import { DatetimeSelectorComponent } from 'src/app/shared/datetime-selector/datetime-selector.component';
import { irrigationZoneOptions, irrigationSourceOptions } from 'src/app/definitions/irrigation-definitions';
import { getDateText, zonesIntToArray } from 'src/app/utils/utils';

@Component({
  selector: 'app-irrigation-dashboard',
  template: `
    <div id="main-content" *ngIf="irrHandler.state$ | async as state; else loading">
      <h3 class="section-title">Riego</h3>
      <h4 class="section-title state">
        Estado: <span [class.on]="!isStateIdle(state.state)">
          {{isStateIdle(state.state) ? 'Inactivo' : (isStateManual(state.state) ? 'Arranque Manual' : 'Arranque Automático')}}
        </span>
      </h4>
      <app-notification id="manual-disabled-notification" *ngIf="state.manualDisable">
        El arranque manual esta deshabilitado hasta que se desactive manualmente desde el cuadro de control.
      </app-notification>
      <!-- Source -->
      <div class="state-overview-container">
        <app-large-state-widget [state]="state.mains" [name]="'Red'"></app-large-state-widget>
        <app-large-state-widget [state]="state.pump" [name]="'Piscina'"></app-large-state-widget>
      </div>
      <!-- Zones -->
      <div class="state-overview-container">
        <app-large-state-widget
          *ngFor="let irrGroup of irrigationZoneOptions"
          [state]="isZoneOn(irrGroup.value)" [name]="irrGroup.value + 1" trueText="" falseText=""
        ></app-large-state-widget>
      </div>
      <ion-button
        *ngIf="isStateAuto(state.state)"
        id="cancel-irrigation-button" color="danger" fill="outline" expand="block"
        (click)="cancelIrrigation()"
      >
        Cancelar Riego
      </ion-button>
      <!-- Manual Irrigation -->
      <app-list-header>Riego Manual</app-list-header>
      <app-list-item (click)="setManualSource()">
        Fuente
        <span slot="value">{{ getSourceName(state.manualSource) }}</span>
          <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
      </app-list-item>
      <app-list-item (click)="setManualZones()">
        Zonas
        <span slot="value">{{ getZoneIndexes(state.manualZones) }}</span>
        <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
      </app-list-item>
      <!-- Scheduled Irrigation -->
      <app-list-header>Riego Automático</app-list-header>
      <app-list-item (click)="irrHandler.toggleScheduleEnable()">
        Programación Activa
        <span slot="value">
          <ion-toggle [checked]="state.scheduleEnable"></ion-toggle>
        </span>
      </app-list-item>
      <app-list-item [disableRipple]="true">
        Próximo Riego
        <span slot="value">
          {{getDateText(state.nextIrrigation)}}
        </span>
      </app-list-item>
      <app-list-item (click)="toggleIrrigationPause()">
        Pausar Riego
        <span slot="value">
          <ion-toggle [checked]="state.resumeTimestamp !== 0"></ion-toggle>
        </span>
      </app-list-item>
      <app-list-item *ngIf="state.resumeTimestamp !== 0" (click)="editIrrigationResumeTime()">
        Reanudar Riego
        <span slot="value">
          {{getDateText(state.resumeTimestamp)}}
        </span>
        <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
      </app-list-item>
      <ion-button id="edit-irr-groups-buttons" fill="outline" color="dark" routerLink="/irrigation-groups">
        Configuración del Riego
        <ion-icon src="assets/icons/chevron-right.svg" slot="end"></ion-icon>
      </ion-button>
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

    .state-overview-container {
      display: flex;
      justify-content: space-between;

      app-large-state-widget {
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 0;
      }
    }

    #cancel-irrigation-button {
      margin: 10px;
    }

    #edit-irr-groups-buttons {
      width: calc(100% - 20px);
      height: 50px;
      margin: 0 10px;
      margin-top: 15px;
      --border-width: 1.5px;
      text-transform: none;
      white-space: normal;
    }
  `],
})
export class IrrigationDashboardComponent {
  @ViewChild(DatetimeSelectorComponent) datetimeSelector : DatetimeSelectorComponent;
  @ViewChild(SelectComponent)           selectComponent  : SelectComponent;

  get irrigationZoneOptions(): SelectItem[] {
    return irrigationZoneOptions;
  }

  constructor(
    public irrHandler    : IrrigationHandlerService,
    public globalHandler : GlobalHandlerService
  ) { }

  isStateIdle(state: IrrigationControllerState): boolean {
    return state === IrrigationControllerState.idle;
  }

  isStateManual(state: IrrigationControllerState): boolean {
    return state === IrrigationControllerState.manual;
  }

  isStateAuto(state: IrrigationControllerState): boolean {
    return state === IrrigationControllerState.auto;
  }

  isZoneOn(zoneIndex: number): boolean {
    // eslint-disable-next-line no-bitwise
    return ((1 << zoneIndex) & this.irrHandler.state$.getValue().activeZones) !== 0;
  }

  getSourceName(sourceIndex: number): string {
    return irrigationSourceOptions[sourceIndex]?.label || '--';
  }

  getZoneIndexes(zoneIndexes: number): string {
    return this.zonesIntToArray(zoneIndexes).map(i => i+1).join(', ') || '--';
  }

  getDateText(timestamp: number): string {
    return getDateText(timestamp);
  }

  zonesIntToArray(zonesInt: number): number[] {
    return zonesIntToArray(zonesInt);
  }

  arrayToZonesInt(zonesArr: number[]): number {
    return arrayToZonesInt(zonesArr);
  }



  // Manual Irrigation Config Functions

  async setManualSource(): Promise<void> {
    const newSource = await this.selectComponent.select(
      this.irrHandler.state.manualSource,
      irrigationSourceOptions,
      'Fuente del Riego Manual'
    );

    if (newSource !== undefined) await this.irrHandler.setManualSource(newSource);
  }

  async setManualZones(): Promise<void> {
    const zonesInt = this.irrHandler.state.manualZones;
    const newZonesArr = await this.selectComponent.multipleSelect(
      this.zonesIntToArray(zonesInt),
      irrigationZoneOptions,
      'Zonas del Riego Manual'
    );
    if (newZonesArr === undefined) return;

    const newZonesInt = this.arrayToZonesInt(newZonesArr);
    if (newZonesInt !== zonesInt) await this.irrHandler.setManualZones(newZonesInt);
  }



  // Scheduled Irrigation Config Functions

  async toggleIrrigationPause(): Promise<void> {
    if (this.irrHandler.state.resumeTimestamp === 0) {
      // Show picker and resume
      const nowISO        = fromUnixTime(this.globalHandler.clock$.getValue()).toISOString();
      const resumeTimeISO = await this.datetimeSelector.select(nowISO, nowISO, '2099', 'Selecciona la Fecha y Hora');
      if (resumeTimeISO !== undefined) this.irrHandler.pauseIrrigation(getUnixTime(parseISO(resumeTimeISO)));
    }
    else {
      this.irrHandler.resumeIrrigation();
    }

  }

  async editIrrigationResumeTime(): Promise<void> {
    // Show picker and resume
    const nowISO        = fromUnixTime(this.globalHandler.clock$.getValue()).toISOString();
    const resumeTimeISO = fromUnixTime(this.irrHandler.state$.getValue().resumeTimestamp).toISOString();
    const newTimeISO = await this.datetimeSelector.select(resumeTimeISO, nowISO, '2099', 'Selecciona la Fecha y Hora');
    if (newTimeISO !== undefined) this.irrHandler.pauseIrrigation(getUnixTime(parseISO(newTimeISO)));
  }

  async cancelIrrigation(): Promise<void> {
    this.irrHandler.cancelIrrigation();
  }

}
