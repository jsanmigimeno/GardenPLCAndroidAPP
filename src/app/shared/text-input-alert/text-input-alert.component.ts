import { IonInput, ModalController } from '@ionic/angular';
import { Component, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-text-input-alert',
  template: ``,
  styles  : [`
  `],
})
export class TextInputAlertComponent {

  constructor(private modalController: ModalController) {}

  async open(value: string, heading: string, placeholder?: string): Promise<string | undefined> {
    const modal = await this.modalController.create({
      component     : TextInputAlertModalComponent,
      cssClass      : 'large-centered-modal',
      componentProps: {
        value,
        heading,
        placeholder,
        return: (newValue: string | undefined) => modal.dismiss(newValue)
      }
    });

    await modal.present();
    return (await modal.onDidDismiss()).data;
  }

}

@Component({
  template: `
    <div id="container">
      <h6>{{heading}}</h6>
      <ion-item>
        <ion-input [value]="value" [placeholder]="placeholder" inputmode="text"></ion-input>
      </ion-item>
      <div id="buttons-container">
        <ion-button fill="clear" color="dark" (click)="cancel()">Cancelar</ion-button>
        <ion-button fill="clear" id="done-button" color="dark" (click)="done()">Aceptar</ion-button>
      </div>
    </div>
  `,
  styles: [`
    #container {
      border-radius: 5px;
      padding: 5%;
      background: white;
    }

    h6 {
      margin-top: 10px;
    }

    ion-item {
      padding: 5% 0;
    }

    ion-input {
      font-family: 'Montserrat';
    }

    #buttons-container {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 10px;

      ion-button {
        text-transform: none;
        font-family: 'Montserrat Medium';
        letter-spacing: normal;
      }

      #done-button {
        font-family: 'Montserrat SemiBold'!important;
      }
    }
  `],
})
export class TextInputAlertModalComponent {
  @Input() value       = '';
  @Input() heading     = 'Introduce el texto';
  @Input() placeholder = 'Texto';
  @Input() return: (value: string | undefined) => void | Promise<void>;

  @ViewChild(IonInput) ionInput: IonInput;

  cancel(): void {
    this.return(undefined);
  }

  done(): void {
    const value = this.ionInput.value;
    this.return(typeof value === 'number' ? value.toString() : value);
  }

}
