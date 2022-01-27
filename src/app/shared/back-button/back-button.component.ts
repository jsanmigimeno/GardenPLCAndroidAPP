import { Component, OnInit, Input, HostListener, Renderer2, ElementRef, ViewChild, Optional } from '@angular/core';
import { IonBackButton, IonRouterOutlet, NavController } from '@ionic/angular';

@Component({
  selector: 'app-back-button',
  template: `
    <ion-ripple-effect></ion-ripple-effect>
    <ion-icon id="arrow" src="assets/icons/arrow-left-sharp-bold.svg"></ion-icon>
    Atrás
  `,
  styles: [`
    :host {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;

      width: 80px;
      padding: 3px 5px;
      border-radius: 2px;
      overflow: hidden;

      font-family: 'Montserrat Medium';
    }

    #arrow {
      font-size: 1em;
    }
  `],
})
export class BackButtonComponent implements OnInit {
  @ViewChild(IonBackButton) backButton: IonBackButton;
  @Input() defaultHref = '/';

  constructor(
    private renderer      : Renderer2,
    private elRef         : ElementRef,
    private navController : NavController,
    @Optional() private routerOutlet: IonRouterOutlet
  ) {}

  @HostListener('click') onClick() {
    if (this.routerOutlet?.canGoBack()) this.navController.pop();
    else if (this.defaultHref !== undefined) this.navController.navigateRoot(this.defaultHref);
  }

  ngOnInit() {
    this.renderer.addClass(this.elRef.nativeElement, 'ion-activatable');
  }

}
