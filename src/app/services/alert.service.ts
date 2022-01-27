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
          text: 'No',
          role: 'cancel',
          id  : 'cancel-button'
        }, {
          text: 'Si',
          role: 'done',
          id  : 'confirm-button'
        }
      ]
    });

    await alert.present();

    return (await alert.onDidDismiss()).role === 'done';
  }
}
