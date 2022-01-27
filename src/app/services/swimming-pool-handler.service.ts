import { CommunicatorService } from './communicator.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from './alert.service';
import { GlobalHandlerService } from './global-handler.service';

export enum SwimmingPoolControllerState {
  idle   = 0,
  manual = 1,
  auto   = 2
}

export interface SwimmingPoolState {
  state             : SwimmingPoolControllerState;
  pump              : boolean;
  uv                : boolean;
  pumpManual        : boolean;
  uvEnable          : boolean;
  flowSensor        : boolean;
  manualDisable     : boolean;
  scheduleEnable    : boolean;
  nextSchedule      : number;
  scheduleDuration  : number;
  schedulePeriod    : number;
}


@Injectable({
  providedIn: 'root'
})
export class SwimmingPoolHandlerService {
  readonly state$ = new BehaviorSubject<SwimmingPoolState | undefined>(undefined);

  get state(): SwimmingPoolState | undefined {
    return this.state$.getValue();
  }

  constructor(
    private globalHandler : GlobalHandlerService,
    private commService   : CommunicatorService,
    private alertService  : AlertService
  ) {
    this.globalHandler.swimmingPoolLastChangeTimestamp$.subscribe(() => this.updateState());
  }

  async toggleScheduleEnable(): Promise<void> {
    const state = this.state;
    if (!state) return;

    const confirmation = await this.alertService.confirmationAlert(
      state.scheduleEnable ? 'Desctivar Filtrado Automático' : 'Activar Filtrado Automático',
      state.scheduleEnable
        ? '¿Estás seguro de que deseas desactivar el filtrado automatico?'
        : '¿Estás seguro de que deseas activar el filtrado automatico?'
    );
    if (confirmation) await this.updateField('scheduleEnable', !state.scheduleEnable, 'sp-schedule-enable');
  }

  async setNextSchedule(timestamp: number): Promise<void> {
    //TODO VALIDATE?
    await this.updateField('nextSchedule', timestamp, 'sp-schedule-next');
  }

  async setDuration(duration: number): Promise<void> {
    //TODO VALIDATE?
    await this.updateField('scheduleDuration', duration, 'sp-schedule-duration');
  }

  async setPeriod(period: number): Promise<void> {
    //TODO VALIDATE?
    await this.updateField('schedulePeriod', period, 'sp-schedule-period');
  }


  private async updateState() {
    const response = await this.commService.sendGetRequest('sp-state', true);

    this.state$.next({
      state           : response.state,
      pump            : response.pump,
      uv              : response.uv,
      pumpManual      : response.pumpManual,
      uvEnable        : response.uvEnable,
      flowSensor      : response.flowSensor,
      manualDisable   : response.manualDisable,
      scheduleEnable  : response.scheduleEnable,
      nextSchedule    : response.nextSchedule,
      scheduleDuration: response.scheduleDuration,
      schedulePeriod  : response.schedulePeriod,
    });
  }

  private async updateField(fieldName: string, value: any, endpoint: string): Promise<boolean> {
    // Do not send request if the state is missing or the value hasn't change
    const state = this.state;
    if (!state) return false;
    if (state[fieldName] === value) return true;

    return this.commService.sendPostRequest(endpoint, {value});
  }

}
