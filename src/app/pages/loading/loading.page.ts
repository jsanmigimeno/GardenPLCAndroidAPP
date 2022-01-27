import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConnectionState, CommunicatorService } from 'src/app/services/communicator.service';

@Component({
  selector: 'app-loading',
  template: `
    <ion-content [fullscreen]="true">
      <div class="card-container loading-card">
        <!-- Connecting Screen -->
        <ng-template [ngIf]="isConnecting(commService.connectionState$ | async)" [ngIfElse]="connectionFailed">
          <h5 id="state-heading">Conectando con el controllador.</h5>
          <ion-spinner></ion-spinner>
        </ng-template>
        <!-- Connecting Failed Screen -->
        <ng-template #connectionFailed>
          <h5 id="state-heading">Error al conectar con el controllador.</h5>
          <ion-button id="reload-button" (click)="retryConnection()" fill="outline">Reintentar</ion-button>
        </ng-template>
        <!-- IP Display/Selector -->
        <div id="ip-address-display-container">
          {{commService.hostIPAddress$ | async}}
          <ion-button id="ip-edit-button" fill="clear" size="small" color="medium" (click)="editIPAddress()">
            <ion-icon name="pencil-sharp" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
  .loading-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5% 8%;

  }

  #state-heading {
    margin-top: 4vh;
    margin-bottom: 5vh;
    text-align: center;
  }

  ion-spinner {
    margin: 5px 0;
  }

  #reload-button {
    height: 38px;
    min-width: 50%;
    margin: 0;
  }

  #ip-address-display-container {
    display: flex;
    align-items: center;

    margin-top: 5vh;
    margin-bottom: 4vh;
    padding-left: 30px;

    font-family: 'Montserrat Medium';
    font-size: 18px;
  }

  #ip-edit-button {
    margin: 0;
    margin-left: 5px;
    --padding-start: 2px;
    --padding-end: 2px;
    --padding-top: 2px;
    --padding-bottom: 2px;
    font-size: 12px;
  }
  `],
})
export class LoadingPage implements OnInit, OnDestroy {

  private connectionStateSubscription: Subscription | undefined;

  constructor(
    public commService    : CommunicatorService,
    private navController : NavController
  ) {}

  ngOnInit(): void {
    this.connectionStateSubscription = this.commService.connectionState$.subscribe(state => {
      if (state === ConnectionState.connected) {
        this.navController.navigateForward('/home');
        this.connectionStateSubscription?.unsubscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.connectionStateSubscription?.unsubscribe();
  }

  async editIPAddress(): Promise<void> {
    await this.commService.editServerIPAddress();
  }

  async retryConnection() {
    await this.commService.waitForInitialConnection();
  }


  isConnecting(connectionState: ConnectionState): boolean {
    return connectionState === ConnectionState.connecting;
  }

}
