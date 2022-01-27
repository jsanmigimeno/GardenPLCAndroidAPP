import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-large-state-widget',
  template: `
    <h4 [class.bold]="state">{{name}}</h4>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-around;
      flex-direction: column;

      border: solid 1px;
      border-radius: 5px;

      height: 60px;
      padding: 5%;
      margin: 10px;
    }

    h4 {
      text-align: center;
      font-size: 16px;
      margin: 0;
    }

    .bold {
      font-weight: bold;
    }
  `],
})
export class LargeStateWidgetComponent {
  @Input() name  = '';
  @Input() state = false;

  @HostBinding('class.on-full') get isFull() {
    return this.state;
  }
  @HostBinding('class.off') get isOff() {
    return !this.state;
  }

}
