import { getDateText } from 'src/app/utils/utils';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-next-irrigation-widget',
  template: `
    <span id="next-heading">Próximo riego:</span><br>
    <span id="next-date">{{getDateText(timestamp)}}</span>
  `,
  styles: [`
    :host {
      display: block;
      text-align: center;
      line-height: 1.8em;
    }

    #next-heading {
      font-size: 16px;
      font-family: 'Montserrat SemiBold'
    }

    #next-date {
      font-size: 20px;
    }
  `],
})
export class NextIrrigationWidgetComponent {
  @Input() timestamp = 0;

  getDateText(timestamp: number): string {
    return getDateText(timestamp);
  }
}
