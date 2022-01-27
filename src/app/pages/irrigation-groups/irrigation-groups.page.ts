import { GlobalHandlerService } from 'src/app/services/global-handler.service';
import { IrrigationHandlerService } from 'src/app/services/irrigation-handler.service';
import { Component } from '@angular/core';
import { getDateText } from 'src/app/utils/utils';

@Component({
  selector: 'app-irrigation-groups',
  template: `
    <ion-content>
      <div class="card-container">
        <app-back-button defaultHref="/"></app-back-button>
        <h4 id="heading">Grupos de Riego</h4>
        <div *ngIf="irrHandler.groupsState$ | async as groupsState; else loading">
          <!-- Notification Warnings -->
          <app-notification *ngIf="(globalHandler.autoMode$ | async) === false">
            El arranque automático esta deshabilitado en el cuadro de control.
          </app-notification>
          <app-notification *ngIf="irrHandler.state.scheduleEnable === false">
            La programacion del riego esta desactivada.
          </app-notification>
          <app-notification color="warning" *ngIf="irrHandler.state.resumeTimestamp">
            La programacion esta pausada hasta el {{getDateText(irrHandler.state.resumeTimestamp)}}.
          </app-notification>
          <!-- Irrigation Groups -->
          <app-list-item
            *ngFor="let group of groupsState; let i = index"
            routerLink="/irrigation-group"
            [queryParams]="{groupIdx: i}"
          >
            {{i+1}}.&nbsp;&nbsp;&nbsp;<span [class.no-name]="!group.name.length">{{group.name.length ? group.name : 'Sin Nombre'}}</span>
            <span slot="value">
              <div class="group-state">
                <span [class.group-enabled]="group.enabled">{{group.enabled ? 'Activado' : ''}}</span>
                <ion-icon src="assets/icons/chevron-right.svg"></ion-icon>
              </div>
            </span>
          </app-list-item>
          <!-- Options -->
          <ion-button color="dark" class="large-button" id="options-button" fill="outline" expand="block" (click)="toggleOptions()">
            {{optionsVisible? 'Ocultar Opciones' : 'Mostrar Mas Opciones'}}
            <ion-icon [src]="optionsVisible? 'assets/icons/chevron-up.svg' : 'assets/icons/chevron-down.svg'" slot="end"></ion-icon>
          </ion-button>
          <div id="extra-options-container" *ngIf="optionsVisible">
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
  `,
  styles: [`
    #heading {
      text-align: center;
      margin-top: 25px;
      margin-bottom: 30px;
    }

    app-notification:first-of-type {
      margin-top: -10px;
    }

    .group-state {
      display: flex;
      align-items: center;
      justify-content: center;

      ion-icon {
        margin-left: 10px;
      }
    }

    app-list-item {
      font-size: 14px;
      --padding: 0 5%;

      span {
        font-weight: bold;
      }
    }

    .group-enabled {
      font-weight: bold;
      color: var(--ion-color-success);
    }

    .no-name {
      font-weight: normal!important;
      font-style: italic;
    }

    .large-button {
      margin: 10px 5%;
      text-transform: none;
      font-size: 12px;
    }

    #options-button {
      margin-top: 30px;
    }

    #reset-button {
      margin-top: 25px;
    }

    #loading {
      height: 30vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
})
export class IrrigationGroupsPage {

  optionsVisible = false;

  constructor(
    public globalHandler : GlobalHandlerService,
    public irrHandler    : IrrigationHandlerService
  ) {}

  getDateText(timestamp: number) {
    return getDateText(timestamp);
  }

  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
  }

  async reset(): Promise<void> {
    await this.irrHandler.reset();
  }

}
