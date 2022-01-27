import { GlobalHandlerService } from './global-handler.service';
import { CommunicatorService } from './communicator.service';
import { AlertService } from './alert.service';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';


export enum IrrigationControllerState {
  idle   = 0,
  manual = 1,
  auto   = 2
}

export interface IrrigationState {
  state           : IrrigationControllerState;
  manualDisable   : boolean;
  pump            : boolean;
  mains           : boolean;
  activeZones     : number;
  manualSource    : number;
  manualZones     : number;
  scheduleEnable  : boolean;
  nextIrrigation  : number;
  resumeTimestamp : number;
}

export interface IrrigationGroupStateOverview {
  name    : string;
  enabled : boolean;
}

export interface IrrigationGroupState {
  index         : number;
  enabled       : boolean;
  name          : string;
  zones         : number;
  source        : number;
  period        : number;
  duration      : number;
  initTime      : number;
  nextTimestamp : number;
}


@Injectable({
  providedIn: 'root'
})
export class IrrigationHandlerService {
  readonly state$       = new BehaviorSubject<IrrigationState | undefined>(undefined);
  readonly groupsState$ = new BehaviorSubject<IrrigationGroupStateOverview[] | undefined>(undefined);

  get state(): IrrigationState | undefined {
    return this.state$.getValue();
  }

  // Store the BS with the data of the loaded irrigation groups
  private irrGroupsData: {[key: number]: BehaviorSubject<IrrigationGroupState>} = {};

  constructor(
    private commService   : CommunicatorService,
    private globalHandler : GlobalHandlerService,
    private alertService  : AlertService
  ) {
    this.globalHandler.irrigationLastChangeTimestamp$.subscribe(() => this.updateState());
  }



  // Global functions

  async toggleScheduleEnable(): Promise<void> {
    const state = this.state;
    if (!state) return;

    const confirmation = await this.alertService.confirmationAlert(
      state.scheduleEnable ? 'Desctivar Riego Automático' : 'Activar Riego Automático',
      state.scheduleEnable
        ? 'Estas seguro de que deseas desactivar el riego automatico?'
        : 'Estas seguro de que deseas activar el riego automatico?'
    );

    if (confirmation) await this.updateField('scheduleEnable', !state.scheduleEnable, 'irr-schedule-enable');
  }

  async setManualZones(zones: number): Promise<void> {
    await this.updateField('manualZones', zones, 'irr-manual-zones');
  }

  async setManualSource(source: number): Promise<void> {
    if (source !== 0 && source !== 1) return;
    await this.updateField('manualSource', source, 'irr-manual-source');
  }

  async pauseIrrigation(resumeTimestamp: number): Promise<void> {
    await this.commService.sendPostRequest('irr-schedule-pause-timestamp', {value: resumeTimestamp});
  }

  async resumeIrrigation(): Promise<void> {
    const confirmation = await this.alertService.confirmationAlert(
      'Reanudar Riego',
      `Estas seguro de que deseas reanudar el riego?`
    );

    if (confirmation) await this.commService.sendPostRequest('irr-schedule-resume', {value: 1});
  }

  async cancelIrrigation(): Promise<void> {
    const confirmation = await this.alertService.confirmationAlert(
      'Cancelar Riego',
      `Estas seguro de que deseas cancelar todos los riegos pendientes?`
    );

    if (confirmation) await this.commService.sendPostRequest('irr-cancel-all', {value: 1});
  }

  async reset(): Promise<void> {
    const confirmation = await this.alertService.confirmationAlert(
      'Borrar Configuración',
      `Estas seguro de que deseas borrar la configuración de TODOS los grupos?`
    );

    if (!confirmation) return;
    await this.commService.sendPostRequest('irr-schedule-reset', {value: 0xBA00});
    await this.updateIrrigationGroupsState();
    await this.updateState();
  }



  // Group functions

  async toggleGroupScheduleEnable(groupIdx: number): Promise<void> {
    const groupData = this.irrGroupsData[groupIdx]?.getValue();
    if (!groupData) return;

    const confirmation = await this.alertService.confirmationAlert(
      groupData.enabled ? 'Desctivar Grupo' : 'Activar Grupo',
      groupData.enabled
        ? `Estas seguro de que deseas desactivar el grupo ${groupIdx+1}. ${groupData.name}?`
        : `Estas seguro de que deseas activar el grupo ${groupIdx+1}. ${groupData.name}?`
    );

    if (confirmation) {
      await this.updateIrrigationGroupField(groupIdx, 'enabled', !groupData.enabled, 'irr-schedule-group-state');
      // await this.updateIrrigationGroupState(groupIdx);
    }
  }

  async setGroupName(groupIdx: number, name: string): Promise<void> {
    await this.updateIrrigationGroupField(groupIdx, 'name', name, 'irr-schedule-group-name');
  }

  async setGroupZones(groupIdx: number, zones: number): Promise<void> {
    await this.updateIrrigationGroupField(groupIdx, 'zones', zones, 'irr-schedule-group-zones');
  }

  async setGroupSource(groupIdx: number, source: number): Promise<void> {
    if (source !== 0 && source !== 1) return; //TODO show warning?
    await this.updateIrrigationGroupField(groupIdx, 'source', source, 'irr-schedule-group-source');
  }

  async setGroupPeriod(groupIdx: number, period: number): Promise<void> {
    await this.updateIrrigationGroupField(groupIdx, 'period', period, 'irr-schedule-group-period');
  }

  async setGroupDuration(groupIdx: number, duration: number): Promise<void> {
    await this.updateIrrigationGroupField(groupIdx, 'duration', duration, 'irr-schedule-group-duration');
  }

  async setGroupInitTime(groupIdx: number, time: number): Promise<void> {
    await this.updateIrrigationGroupField(groupIdx, 'initTime', time, 'irr-schedule-group-init-time');
  }

  async updateIrrigationGroupField(groupIdx: number, fieldName: string, value: any, endpoint: string): Promise<boolean> {
    // Do not send request if the state is missing or the value hasn't change
    const state = this.irrGroupsData[groupIdx]?.getValue();
    if (!state) return false;
    if (state[fieldName] === value) return true;

    return this.commService.sendPostRequest(endpoint, {groupIdx, value});
  }

  async startGroupNow(groupIdx: number): Promise<void> {
    const confirmation = await this.alertService.confirmationAlert(
      'Iniciar Ahora',
      `Estas seguro de que deseas iniciar el grupo ${groupIdx+1} ahora?`
    );

    if (!confirmation) return;
    await this.commService.sendPostRequest('irr-schedule-group-now', {value: groupIdx});
  }

  async resetGroup(groupIdx: number): Promise<void> {
    const confirmation = await this.alertService.confirmationAlert(
      'Borrar Configuración',
      `Estas seguro de que deseas borrar la configuracion del grupo ${groupIdx+1}?`
    );

    if (!confirmation) return;
    await this.commService.sendPostRequest('irr-schedule-group-reset', {groupIdx, value: 0xBB01});
  }



  // Data update functions

  async updateIrrigationGroupState(groupIdx: number): Promise<BehaviorSubject<IrrigationGroupState>> {
    const response = await this.commService.sendGetRequest('irr-group-state', true, {groupIdx});
    const groupData: IrrigationGroupState = { index: groupIdx, ...response };

    // If group loaded, update BS, else create a new BS
    if (!(groupIdx in this.irrGroupsData)) this.irrGroupsData[groupIdx] = new BehaviorSubject(groupData);
    else                                   this.irrGroupsData[groupIdx].next(groupData);

    return this.irrGroupsData[groupIdx];
  }

  async getIrrigationGroupStateOverview(groupIdx: number): Promise<BehaviorSubject<IrrigationGroupState>> {
    return this.updateIrrigationGroupState(groupIdx);
  }


  private async updateState() {
    const response = await this.commService.sendGetRequest('irr-state', true);

    this.state$.next({
      state          : response.state,
      manualDisable  : response.manualDisable,
      pump           : response.pump,
      mains          : response.mains,
      activeZones    : response.activeZones,
      manualSource   : response.manualSource,
      manualZones    : response.manualZones,
      scheduleEnable : response.scheduleEnable,
      nextIrrigation : response.nextIrrigation,
      resumeTimestamp: response.resumeTimestamp
    });

    this.updateIrrigationGroupsState();
  }

  private async updateIrrigationGroupsState() {
    const response = await this.commService.sendGetRequest('irr-groups-state', true);
    //Todo failed response

    const formattedState: IrrigationGroupStateOverview[] = [];
    const groupsCount = Object.keys(response).length;

    for (let i = 0; i < groupsCount; i++) {
      const groupResponse = response[i.toString()];
      formattedState.push({
        name   : groupResponse.name,
        enabled: groupResponse.enabled !== 0 // Playing safe - required?
      });
    }

    this.groupsState$.next(formattedState);
  }

  async updateField(fieldName: string, value: any, endpoint: string): Promise<boolean> {
    // Do not send request if the state is missing or the value hasn't change
    const state = this.state;
    if (!state) return false;
    if (state[fieldName] === value) return true;

    return this.commService.sendPostRequest(endpoint, {value});
  }

}
