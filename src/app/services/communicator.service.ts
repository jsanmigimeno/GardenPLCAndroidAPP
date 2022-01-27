import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { App } from '@capacitor/app';
import { Storage } from '@capacitor/storage';

import { TextInputAlertModalComponent } from '../shared/text-input-alert/text-input-alert.component';

const HOST_IP_KEY_NAME       = 'hostIP';
const MAX_CONNECTING_TIMEOUT = 1000;

export enum ConnectionState {
  connecting = 0,
  connectingFailed,
  connected,
  disconnected,
}

@Injectable({
  providedIn: 'root'
})
export class CommunicatorService {
  readonly connectionState$ = new BehaviorSubject<ConnectionState>(ConnectionState.connecting);
  readonly hostIPAddress$   = new BehaviorSubject<string | undefined>(undefined);

  private requestActive = false;

  private readonly connectionCheckPeriod = 1000;
  private nextConnectionCheckTimeout: any;

  get hostIPAddress(): string | undefined {
    return this.hostIPAddress$.getValue();
  }

  constructor(
    private http: HttpClient,
    private modalController: ModalController
  ) {
    this.initialise();
  }

  private async initialise() {
    await this.loadServerIPAddress();

    if (this.hostIPAddress == null) await this.editServerIPAddress();

    await this.waitForInitialConnection();
  }



  // Connection config/state monitor functions

  async waitForInitialConnection() {
    if (this.hostIPAddress == null) {
      this.connectionState$.next(ConnectionState.connectingFailed);
      return;
    }

    this.connectionState$.next(ConnectionState.connecting);
    const startTimestamp = Date.now();

    while (true) {
      const isLive = await this.isConnectionLive();
      if (isLive) {
        this.connectionState$.next(ConnectionState.connected);
        this.startConnectionIntervalCheck();
        this.listenToAppStateChanges();
        break;
      }
      else if (Date.now() - startTimestamp > MAX_CONNECTING_TIMEOUT) {  // Connection timed out
        this.connectionState$.next(ConnectionState.connectingFailed);
        break;
      }

      await new Promise(r => setTimeout(r, this.connectionCheckPeriod)); // Delay between checks
    }
  }

  private async updateConnectionState(): Promise<void> {
    this.connectionState$.next(
      (await this.isConnectionLive()) ? ConnectionState.connected : ConnectionState.disconnected
    );
  }

  private async isConnectionLive(): Promise<boolean> {
    return (await this.sendGetRequest('')) === 'GardenPLC';
  }

  private listenToAppStateChanges() {
    // Stop checking connection with the PLC once the app goes to the background. Resume if the app comes to the foreground.
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) this.startConnectionIntervalCheck();
      else          this.stopConnectionIntervalCheck();
    });
  }

  private startConnectionIntervalCheck() {
    clearTimeout(this.nextConnectionCheckTimeout); // Make sure only one check interval is active

    const setNextCheck = () => {
      this.nextConnectionCheckTimeout = setTimeout(async () => {
        await this.updateConnectionState();
        setNextCheck();
      }, this.connectionCheckPeriod);
    };

    setNextCheck();
  }

  private stopConnectionIntervalCheck() {
    clearTimeout(this.nextConnectionCheckTimeout);
  }


  private async loadServerIPAddress(): Promise<void> {
    const { value } = await Storage.get({ key: HOST_IP_KEY_NAME });

    if (value == null || value === '') return;

    this.hostIPAddress$.next(value);
  }

  private async saveServerIPAddress(ipAddress: string): Promise<void> {
    await Storage.set({key: HOST_IP_KEY_NAME, value: ipAddress});
    this.hostIPAddress$.next(ipAddress);
  }

  async editServerIPAddress(): Promise<void> {
    const modal = await this.modalController.create({
      component      : TextInputAlertModalComponent,
      cssClass       : 'large-centered-modal',
      backdropDismiss: false,
      componentProps : {
        heading    : 'Introduce la IP del Controlador.',
        placeholder: 'Dirección IP',
        value      : this.hostIPAddress,
        return     : (data: string) => modal.dismiss(data)
      }
    });

    await modal.present();

    const ipAddress: string = (await modal.onDidDismiss()).data;

    if (ipAddress !== undefined) await this.saveServerIPAddress(ipAddress);
  }



  // API communication helper functions
  async sendGetRequest(instruction: string, isJson?: boolean, payload?: {[key: string]: any}): Promise<any> {
    while (this.requestActive) await new Promise(r => setTimeout(r, 20)); // Wait for communication channel to be free

    let response: any;

    this.requestActive = true;
      const requestURI = this.getURI(instruction, payload);

    if (isJson) {
      try {
        response = this.http.get(requestURI).toPromise();
      }
      catch (e) {
        console.error(e);
      }
    }
    else {
      try {
        const httpResponse = await this.http.get(requestURI, {observe: 'response', responseType: 'text'}).toPromise();
        if (httpResponse.status === 200) response = httpResponse.body;
      }
      catch (e) {
        console.error(e);
      }
    }

    this.requestActive = false;
    return response;

  }

  async sendPostRequest(instruction: string, payload: {[key: string]: any}): Promise<boolean> {
    while (this.requestActive) await new Promise(r => setTimeout(r, 20)); // Wait for communication channel to be free

    let success = false;
    this.requestActive = true;
    try {
      const requestURI = this.getURI(instruction, payload);

      const httpResponse = await this.http.post(
        requestURI,
        undefined, //TODO SHOULD USE THIS FOR PAYLOAD - HOW TO?
        {observe: 'response', responseType: 'text'}
      ).toPromise();
      if (httpResponse.status === 200) success = true;
    }
    catch (e) {
      console.error(e);
    }

    this.requestActive = false;
    return success;
  }

  private getURI(instruction: string, payload?: {[key: string]: string}): string {
    const payloadString = payload
    ? '?' + Object.entries(payload).map(el => `${el[0]}=${typeof(el[1])==='boolean'?(el[1]?1:0):el[1]}`).join('&')
    : '';
    return `http://${this.hostIPAddress}/${instruction}` + payloadString;
  }

}
