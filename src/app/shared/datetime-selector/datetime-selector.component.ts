import { Component, Input, ViewChild } from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-datetime-selector',
  template: ``,
  styles  : [`
  `],
})
export class DatetimeSelectorComponent {

  constructor(private modalController: ModalController) {}

  async select(value?: string, min: string = undefined, max: string = '2099', heading?: string): Promise<string | undefined> {
    const modal = await this.modalController.create({
      component     : DatetimeSelectorModalComponent,
      cssClass      : 'large-centered-modal',
      componentProps: {
        return: (data?: any) => modal.dismiss(data),
        min, max, value, heading
      }
    });

    await modal.present();

    return (await modal.onDidDismiss()).data;
  }

  async selectTime(value?: string, heading?: string): Promise<string | undefined> {
    const modal = await this.modalController.create({
      component     : DatetimeSelectorModalComponent,
      cssClass      : 'large-centered-modal',
      componentProps: {
        return      : (data?: any) => modal.dismiss(data),
        presentation: 'time',
        value, heading
      }
    });

    await modal.present();

    return (await modal.onDidDismiss()).data;
  }
}

@Component({
  selector: 'app-datetime-selector-modal',
  template: `
    <h4 *ngIf="heading !== undefined">{{heading}}</h4>
    <ion-datetime locale="es-ES" first-day-of-week="1" [presentation]="presentation" [min]="min" [max]="max" [value]="value">
      <ion-buttons slot="buttons">
        <ion-button (click)="cancel()">Cancelar</ion-button>
        <ion-button (click)="confirm()">Aceptar</ion-button>
      </ion-buttons>
      <span slot="time-label" id="time-label">Hora</span>
    </ion-datetime>
  `,
  styles: [`
    :host {
      background: white;
      padding: 5%;
      border-radius: 5px;
    }

    h4 {
      text-align: center;
      margin: 1em 15px;
    }

    #time-label {
      font-family: "Montserrat SemiBold";
      font-size: 16px;
    }
  `],
})
export class DatetimeSelectorModalComponent {
  @ViewChild(IonDatetime) datetime: IonDatetime;
  @Input() return : (data?: any) => void | Promise<void>;
  @Input() min    : string | undefined;
  @Input() max    : string | undefined;
  @Input() value  : string | undefined;
  @Input() presentation = 'date-time';
  @Input() heading: string | undefined;

  async confirm() {
    await this.datetime.confirm();
    this.return(this.datetime.value);
  }

  cancel() {
    this.return(undefined);
  }
}
