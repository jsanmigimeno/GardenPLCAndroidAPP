import { Component } from '@angular/core';

import { GlobalHandlerService } from 'src/app/services/global-handler.service';
import { CommunicatorService, ConnectionState } from 'src/app/services/communicator.service';

@Component({
  selector: 'app-home',
  template: `
    <ion-content [fullscreen]="true">
      <div id="main-content">
        <app-notification id="no-connection" *ngIf="(commService.connectionState$ | async) !== connectionStateConnected">
          Sin Conexión
        </app-notification>
        <div class="card-container">
          <app-clock></app-clock>
          <h1 id="title" [ngClass]="(globalHandler.autoMode$ | async) ? 'on' : 'off'">
            {{(globalHandler.autoMode$ | async) ? 'Modo Automático' : 'Modo Manual'}}
          </h1>
        </div>
        <div class="card-container">
          <app-irrigation-dashboard></app-irrigation-dashboard>
        </div>
        <div class="card-container">
          <app-swimming-pool-dashboard></app-swimming-pool-dashboard>
        </div>
        <div class="card-container">
          <ion-button (click)="reload()" fill="outline" size="block">Recargar Datos</ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    #no-connection {
      margin: 5%;
      font-size: 18px;
      font-family: 'Montserrat SemiBold';
    }

    #title {
      margin-top: 8px;
      font-family: "Montserrat Medium";
      text-align: center;
      font-size: 18px;
    }
  `],
})
export class HomePage {
  constructor(
    public commService   : CommunicatorService,
    public globalHandler : GlobalHandlerService
  ) {}

  readonly connectionStateConnected = ConnectionState.connected;

  reload() {
    location.reload();
  }

}
