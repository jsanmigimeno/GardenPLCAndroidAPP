import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalHandlerService } from 'src/app/services/global-handler.service';
import { IrrigationHandlerService } from 'src/app/services/irrigation-handler.service';
import { IrrigationGroupState } from 'src/app/services/irrigation-handler.service';
import { arrayToZonesInt, zonesIntToArray } from './../../utils/utils';
import { TextInputAlertComponent } from 'src/app/shared/text-input-alert/text-input-alert.component';
import { Subscription, BehaviorSubject } from 'rxjs';
import { formatDuration, getDateText } from 'src/app/utils/utils';
import { SelectComponent } from 'src/app/shared/select/select.component';
import { DatetimeSelectorComponent } from 'src/app/shared/datetime-selector/datetime-selector.component';
import { irrigationSourceOptions, irrigationZoneOptions, irrigationPeriodOptions } from 'src/app/definitions/irrigation-definitions';

@Component({
  selector: 'app-irrigation-group',
  template: `
  <ion-content>
    <div class="card-container">
      <app-back-button defaultHref="/irrigation-groups"></app-back-button>
      <div *ngIf="groupData$ | async as groupData; else loading">
        <div id="heading-container">
          <h2 id="heading">
            {{groupData.index+1}}. {{groupData.name}}
            <span id="no-name-placeholder" *ngIf="!groupData.name">Sin Nombre</span>
          </h2>
          <ion-button id="name-edit-button" fill="clear" size="small" color="medium" (click)="setGroupName()">
            <ion-icon name="pencil-sharp" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
        <app-next-irrigation-widget
          id="next-irrigation"
          *ngIf="groupData.enabled"
          [timestamp]="groupData.nextTimestamp"
        ></app-next-irrigation-widget>
        <!-- State -->
        <app-list-item>
          Activado
          <span slot="value" (click)="toggleScheduleEnable()">
            <ion-toggle [checked]="groupData.enabled"></ion-toggle>
          </span>
        </app-list-item>
        <app-list-item (click)="setGroupSource()">
          Fuente
          <span slot="value">{{ getSourceName(groupData.source) }}</span>
          <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
        </app-list-item>
        <app-list-item (click)="setGroupZones()">
          Zonas
          <span slot="value">{{ getZonesText(groupData.zones) }}</span>
          <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
        </app-list-item>
        <app-list-item (click)="setGroupDuration()">
          Duración
          <span slot="value">{{ formatDuration(groupData.duration) }}</span>
          <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
        </app-list-item>
        <app-list-item (click)="setGroupPeriod()">
          Periodo
          <span slot="value">{{ formatPeriod(groupData.period) }}</span>
          <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
        </app-list-item>
        <app-list-item (click)="setGroupStartTime()">
          Inicio
          <span slot="value">{{ formatTime(groupData.initTime) }}</span>
          <ion-icon src="assets/icons/chevron-right.svg" slot="icon-end"></ion-icon>
        </app-list-item>
        <!-- Options -->
        <ion-button color="dark" class="large-button" id="options-button" fill="outline" expand="block" (click)="toggleOptionsVisibility()">
          {{optionsVisible? 'Ocultar Opciones' : 'Mostrar Mas Opciones'}}
          <ion-icon [src]="optionsVisible? 'assets/icons/chevron-up.svg' : 'assets/icons/chevron-down.svg'" slot="end"></ion-icon>
        </ion-button>
        <div id="extra-options-container" *ngIf="optionsVisible">
          <ion-button class="large-button" id="start-now-button" fill="outline" expand="block" (click)="startNow()">
            Iniciar Ahora
          </ion-button>
          <ion-button color="danger" class="large-button" id="reset-button" fill="outline" expand="block" (click)="reset()">
            Borrar Configuración
          </ion-button>
        </div>
      </div>
      <ng-template #loading>
        <div id="loading">
          <ion-spinner></ion-spinner>
        </div>
      </ng-template>
    </div>
  </ion-content>
  <app-select></app-select>
  <app-datetime-selector></app-datetime-selector>
  <app-text-input-alert></app-text-input-alert>
  `,
  styles: [`
    #heading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      margin-top: 25px;
    }

    #loading {
      height: 30vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #heading {
      text-align: center;
      margin: 0;
      margin-left: 15px;
      margin-bottom: 2px;
      line-height: 1.5em;
      font-size: 20px;

      #no-name-placeholder {
        font-family: 'Montserrat';
        font-style: italic;
      }
    }

    #name-edit-button {
      margin: 0;
      margin-left: 5px;
      font-size: 12px;
      --padding-start: 2px;
      --padding-end: 2px;
      --padding-top: 2px;
      --padding-bottom: 2px;
    }

    #next-irrigation {
      margin-top: 10px;
    }

    app-list-item:first-of-type {
      margin-top: 20px;
    }

    .large-button {
      margin: 10px 5%;
      text-transform: none;
      font-size: 12px;
    }

    #options-button {
      margin-top: 30px;
    }

    #start-now-button {
      margin-top: 25px;
    }
  `],
})
export class IrrigationGroupPage implements OnInit, OnDestroy {
  @ViewChild(SelectComponent)           selectComponent         : SelectComponent;
  @ViewChild(TextInputAlertComponent)   textInputAlertComponent : TextInputAlertComponent;
  @ViewChild(DatetimeSelectorComponent) datetimeSelector        : DatetimeSelectorComponent;

  readonly groupData$ = new BehaviorSubject<IrrigationGroupState | undefined>(undefined);

  optionsVisible = false;

  private routeSubscription     : Subscription | undefined;
  private groupDataSubscription : Subscription | undefined;
  private irrChangeSubscription : Subscription | undefined;

  get groupIdx(): number {
    return this.groupData$.getValue().index;
  }

  constructor(
    private activatedRoute : ActivatedRoute,
    private irrHandler     : IrrigationHandlerService,
    private globalHandler  : GlobalHandlerService
  ) {}

  ngOnInit() {
    this.routeSubscription = this.activatedRoute.queryParams.subscribe(params => this.loadGroupData(parseInt(params.groupIdx, 10)));
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.groupDataSubscription?.unsubscribe();
  }

  ionViewDidEnter(): void {
    this.irrChangeSubscription = this.globalHandler.irrigationLastChangeTimestamp$.subscribe(() => {
      this.irrHandler.updateIrrigationGroupState(this.groupIdx);
    });
  }

  ionViewWillLeave(): void {
    this.irrChangeSubscription?.unsubscribe();
  }


  // Display functions
  getSourceName(sourceIndex: number): string {
    return irrigationSourceOptions[sourceIndex]?.label || '--';
  }

  getZonesText(zoneIndexes: number): string {
    return zonesIntToArray(zoneIndexes).map(i => i+1).join(', ') || '--';
  }

  getDateText(timestamp: number): string {
    return getDateText(timestamp);
  }

  formatDuration(duration: number): string {
    return formatDuration(duration, 's');
  }

  formatPeriod(period: number): string {
    if (period < 24) return period.toFixed(0) + (period === 1 ? ' Hora' : ' Horas');

    const daysCount = period/24;
    return daysCount.toFixed(0) + (daysCount === 1 ? ' Dia' : ' Dias');
  }

  formatTime(time: number): string {
    let timezoneCorrectedTime = time - new Date().getTimezoneOffset();
    if (timezoneCorrectedTime >= 1440) timezoneCorrectedTime -= 1440;
    const hours = Math.floor(timezoneCorrectedTime/60);
    const minutes = timezoneCorrectedTime - 60*hours;

    return hours.toFixed(0).padStart(2, '0') + ':' + minutes.toFixed(0).padStart(2, '0');
  }



  // Config edit functions
  async toggleScheduleEnable(): Promise<void> {
    await this.irrHandler.toggleGroupScheduleEnable(this.groupIdx);
  }

  async setGroupName(): Promise<void> {
    const newName = await this.textInputAlertComponent.open(this.groupData$.getValue().name, 'Nombre del Grupo', 'Nombre');
    if (newName !== undefined) await this.irrHandler.setGroupName(this.groupIdx, newName);
  }

  async setGroupSource(): Promise<void> {
    const newSource = await this.selectComponent.select(
      this.groupData$.getValue().source,
      irrigationSourceOptions,
      'Selecciona Fuente'
    );

    if (newSource !== undefined) await this.irrHandler.setGroupSource(this.groupIdx, newSource);
  }

  async setGroupZones(): Promise<void> {
    const zonesInt = this.groupData$.getValue().zones;
    const newZonesArr = await this.selectComponent.multipleSelect(
      zonesIntToArray(zonesInt),
      irrigationZoneOptions,
      'Selecciona Fuente'
    );
    if (newZonesArr === undefined) return;

    const newZonesInt = arrayToZonesInt(newZonesArr);
    if (newZonesInt !== zonesInt) await this.irrHandler.setGroupZones(this.groupIdx, newZonesInt);
  }

  async setGroupPeriod(): Promise<void> {
    const newPeriod = await this.selectComponent.select(
      this.groupData$.getValue().period,
      irrigationPeriodOptions,
      'Selecciona El Periodo de Riego'
    );

    if (newPeriod !== undefined) await this.irrHandler.setGroupPeriod(this.groupIdx, newPeriod);
  }

  async setGroupDuration(): Promise<void> {
    // TODO     THIS IMPLEMENTATION CURRENTLY USES IONIC'S DATE TIME PICKER
    // TODO     SINCE IT DOES NOT CONTAIN FUNCTIONALITY TO SELECT A MM:SS VALUE, THE HH:MM IS USED INSTEAD
    // TODO     HENCE, MAXIMUM 24min OF IRRIGATION CAN BE SELECTED
    // TODO     FIX.
    const currentDuration = this.groupData$.getValue().duration;
    const currentMinutes  = Math.floor(currentDuration/60);
    const currentSeconds  = currentDuration - currentMinutes*60;

    const newTimeString = await this.datetimeSelector.selectTime(
      `${currentMinutes.toFixed(0).padStart(2, '0')}:${currentSeconds.toFixed(0).padStart(2, '0')}`,
      'Selecciona la Duración del Riego'
    );
    if (newTimeString === undefined) return;

    const newMinutes = parseInt(newTimeString.substring(0, 2), 10);
    const newSeconds = parseInt(newTimeString.substring(3, 5), 10);

    const newTimeInSeconds = newMinutes*60 + newSeconds;

    await this.irrHandler.setGroupDuration(this.groupIdx, newTimeInSeconds);
  }

  async setGroupStartTime(): Promise<void> {
    let currentStartTime = this.groupData$.getValue().initTime - new Date().getTimezoneOffset(); // Correct timezone
    if (currentStartTime >= 1440) currentStartTime -= 1440; // If start time is after the 23:59h mark (after timezone correction), remove 24h

    const currentHours   = Math.floor(currentStartTime/60);
    const currentMinutes = currentStartTime - currentHours*60;

    const newTimeString = await this.datetimeSelector.selectTime(
      `${currentHours.toFixed(0).padStart(2, '0')}:${currentMinutes.toFixed(0).padStart(2, '0')}`,
      'Selecciona la Hora de Riego'
    );
    if (newTimeString === undefined) return;

    const newHours   = parseInt(newTimeString.substring(0, 2), 10);
    const newMinutes = parseInt(newTimeString.substring(3, 5), 10);

    let  newTimeInMinutes = newHours*60 + newMinutes + (new Date()).getTimezoneOffset(); // Correct timezone
    if (newTimeInMinutes < 0) newTimeInMinutes += 1440; // If start time is before the 00:00 mark (after timezone correction), add 24h

    await this.irrHandler.setGroupInitTime(this.groupIdx, newTimeInMinutes);
  }

  async startNow(): Promise<void> {
    await this.irrHandler.startGroupNow(this.groupIdx);
  }

  async reset(): Promise<void> {
    await this.irrHandler.resetGroup(this.groupIdx);
  }

  toggleOptionsVisibility(): void {
    this.optionsVisible = !this.optionsVisible;
  }


  private async loadGroupData(groupIdx: number) {
    // Unsubsribe to current group, and subscribe to the new group
    this.groupDataSubscription?.unsubscribe();

    const data$ = await this.irrHandler.getIrrigationGroupStateOverview(groupIdx);
    this.groupDataSubscription = data$.subscribe(d => this.groupData$.next(d));
  }
}
