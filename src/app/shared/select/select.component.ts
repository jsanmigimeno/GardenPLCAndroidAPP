import { Component, ViewChild } from '@angular/core';
import { IonSelect } from '@ionic/angular';
import { merge } from 'rxjs';
import { take } from 'rxjs/operators';

export interface SelectItem {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select',
  template: `
    <ion-select [interfaceOptions]="customAlertOptions" interface="alert" [multiple]="multiple" placeholder="Select One">
      <ion-select-option [value]="el.value" *ngFor="let el of selectItems">{{el.label}}</ion-select-option>
    </ion-select>
  `,
  styles: [`
    :host {
      display: none;
    }
  `],
})
export class SelectComponent {
  @ViewChild(IonSelect) ionSelect: IonSelect;

  multiple = false;
  selectItems: SelectItem[] = [];
  customAlertOptions: any = {
    header     : '',
    subHeader  : '',
    message    : '',
    translucent: true
  };

  async select(
    value     : any | any[],
    items     : SelectItem[],
    header    : string,
    subHeader : string = '',
    message   : string = '',
    multiple  : boolean = false
  ): Promise<any> {

    this.ionSelect.value = value;
    this.selectItems     = items;
    this.multiple        = multiple;

    this.customAlertOptions.header    = header;
    this.customAlertOptions.subHeader = subHeader;
    this.customAlertOptions.message   = message;

    await this.ionSelect.open();
    await merge(this.ionSelect.ionChange, this.ionSelect.ionCancel).pipe(take(1)).toPromise();

    return this.ionSelect.value;
  }

  async multipleSelect(
    value     : any | any[],
    items     : SelectItem[],
    header    : string,
    subHeader : string = '',
    message   : string = '',
  ): Promise<any> {

    return this.select(value, items, header, subHeader, message, true);

  }
}
