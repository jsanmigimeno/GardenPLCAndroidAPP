import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-header',
  template: `
    <div class="header-menu-item">
      <h4 id="header"><ng-content></ng-content></h4>
    </div>
    <div class="divider" *ngIf="!hideDivider"></div>
  `,
  styles: [
    `
    :host {
      display: block;
      font-size: 14px;
    }

    .header-menu-item {
      position: relative;
      padding: 0 8%;
      padding-top: 10px;
      padding-bottom: 5px;
      text-align: center;
    }

    #header {
      font-size: inherit;
    }

    .divider {
      height: 1px;
      background-color: var(--ion-color-dark);
      margin: 0 4%;
    }
    `
  ],
})
export class ListHeaderComponent {
  @Input() hideDivider = false;
}
