import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-item',
  template: `
    <div class="menu-item ion-activatable" [class.disabled]="disabled">
      <ion-ripple-effect *ngIf="!disableRipple && !disabled"></ion-ripple-effect>
      <div [class.disabled]="disabled" [ngClass]="iconStart.children.length !== 0 ? 'item-icon-container icon-start' : ''" #iconStart>
        <ng-content select="[slot='icon-start']"></ng-content>
      </div>
      <div [class.disabled]="disabled" class="item-label"><ng-content></ng-content></div>
      <div [class.disabled]="disabled" [ngClass]="value.children.length !== 0 ? 'item-value' : ''" #value>
        <ng-content select="[slot='value']"></ng-content>
      </div>
      <div [class.disabled]="disabled" [ngClass]="iconEnd.children.length !== 0 ? 'item-icon-container icon-end' : ''" #iconEnd>
        <ng-content select="[slot='icon-end']"></ng-content>
      </div>
    </div>
    <div class="divider" *ngIf="!hideDivider"></div>
  `,
  styles: [
    `
    :host {
      display: block;
      --padding: 0 5%;
      --height: 50px;
      font-size: 15px;
      font-weight: bold;
    }

    .menu-item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      height: var(--height);;
      padding: var(--padding);
      font-family: 'Montserrat Medium';
    }

    .item-icon-container {
      width: 39px;
      display: flex;
      align-items: center;
    }

    .icon-start {
      justify-content: flex-start;
    }

    .icon-start ::ng-deep ion-icon {
      font-size: 1.3em;
    }

    .icon-end {
      justify-content: flex-end;
      color: var(--ion-color-dark-tint);
    }

    .divider {
      height: 1px;
      background-color: var(--ion-color-light);
      margin: 0 4%;
    }

    .item-label {
      display: flex;
      align-items: center;
      flex-grow: 1;
      min-width: 0;
      overflow: hidden;
      /* white-space: nowrap; */
      text-overflow: ellipsis;
    }

    .item-value {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-grow: 1;
      flex-shrink: 1;
      min-width: fit-content;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-left: 10px;
      color: var(--ion-color-dark-tint);
      font-family: 'Montserrat';
    }

    .disabled {
      color: var(--ion-color-tertiary-shade)!important;
      pointer-events: none;
    }
    `
  ],
})
export class ListItemComponent {
  @Input() disabled      = false;
  @Input() hideDivider   = false;
  @Input() disableRipple = false;
}
