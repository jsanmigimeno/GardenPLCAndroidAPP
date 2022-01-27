import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertController: AlertController) {}

  async confirmationAlert(header: string, message = ''): Promise<boolean> {

    const alert = await this.alertController.create({
      cssClass: 'alert-style',
      header,
      message,
      buttons : [
        {
          text    : 'No',
          role    : 'cancel',
          cssClass: 'secondary',
          id      : 'cancel-button',
          handler : () => alert.dismiss(false)
        }, {
          text   : 'Si',
          id     : 'confirm-button',
          handler: () => alert.dismiss(true)
        }
      ]
    });

    await alert.present();

    return (await alert.onDidDismiss()).data;
  }
}
