import { Component, Input, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-notification',
  template: `
    <ng-content></ng-content>
  `,
  styles: [`
    :host {
      display: block;
      margin: 10px;
      padding: 5%;
      border-radius: 5px;

      color: var(--ion-color-danger-contrast);
      background: var(--ion-color-danger);

      text-align: center;
      font-size: 14px;
      line-height: 1.4em;
    }
  `],
})
export class NotificationComponent {
  @Input() set color(color: string) {
    this.renderer.setStyle(this.elRef.nativeElement, 'color', `var(--ion-color-${color}-contrast)`);
    this.renderer.setStyle(this.elRef.nativeElement, 'background', `var(--ion-color-${color})`);
  }

  constructor(
    private elRef    : ElementRef,
    private renderer : Renderer2
  ) {}
}
