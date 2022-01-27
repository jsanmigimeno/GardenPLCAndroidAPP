import { AlertService } from './alert.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommunicatorService, ConnectionState } from './communicator.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalHandlerService {
  readonly autoMode$ = new BehaviorSubject<boolean>(false);
  readonly clock$    = new BehaviorSubject<number | undefined>(undefined);

  readonly globalLastChangeTimestamp$       = new BehaviorSubject(-1);
  readonly swimmingPoolLastChangeTimestamp$ = new BehaviorSubject(-1);
  readonly irrigationLastChangeTimestamp$   = new BehaviorSubject(-1);

  constructor(private commService: CommunicatorService, private alertService: AlertService) {
    this.commService.connectionState$.subscribe(connectionState => {
      if (connectionState === ConnectionState.connected) this.checkChanges();
    });
    this.globalLastChangeTimestamp$.subscribe(() => this.updateState());
  }

  async updateClock(): Promise<void> {
    const confirmation = await this.alertService.confirmationAlert(
      'Actualizar Reloj',
      'Al actualizar el reloj cualquier trabajo en marcha se detendrá. ¿Continuar?'
    );
    if (confirmation) await this.commService.sendPostRequest('clock', {value: Date.now()/1000});
  }

  private async updateState() {
    const response = await this.commService.sendGetRequest('state', true);

    this.autoMode$.next(response.auto);
    this.clock$.next(response.clock);

  }

  private async checkChanges(): Promise<void> {
    const changes = await this.commService.sendGetRequest('changes', true);

    this.clock$.next(changes.clock);
    if (changes.global && changes.global !== this.globalLastChangeTimestamp$.getValue()) {
      this.globalLastChangeTimestamp$.next(changes.global);
    }
    if (changes.swimmingPool && changes.swimmingPool !== this.swimmingPoolLastChangeTimestamp$.getValue()) {
      this.swimmingPoolLastChangeTimestamp$.next(changes.swimmingPool);
    }
    if (changes.irrigation && changes.irrigation !== this.irrigationLastChangeTimestamp$.getValue()) {
      this.irrigationLastChangeTimestamp$.next(changes.irrigation);
    }
  }

}
