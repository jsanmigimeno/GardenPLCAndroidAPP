import { BehaviorSubject, Subscription } from 'rxjs';
import { GlobalHandlerService } from 'src/app/services/global-handler.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { differenceInMinutes } from 'date-fns';


const WEEK_DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES    = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

@Component({
  selector: 'app-clock',
  template: `
    <h3>{{clock$ | async}}</h3>
    <h4>{{date$ | async}}</h4>
    <app-notification id="out-of-date-notification" *ngIf="outOfDate$ | async">
      El reloj del controlador esta desajustado.
      <ion-button (click)="globalHandler.updateClock()">Poner en hora</ion-button>
    </app-notification>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    h3 {
      font-size: 30px;
      font-weight: 300;
      margin: 0;
      margin-top: 10px;
      font-family: "Montserrat Medium";
      letter-spacing: 0.1em;
    }

    h4 {
      font-size: 17px;
      font-family: "Montserrat Medium";
      margin-top: 8px;
    }

    #out-of-date-notification {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;

      ion-button {
        margin-top: 10px;
      }
    }
  `],
})
export class ClockComponent implements OnInit, OnDestroy {

  readonly date$      = new BehaviorSubject<string>('');
  readonly clock$     = new BehaviorSubject<string>('');
  readonly outOfDate$ = new BehaviorSubject<boolean>(false);

  private readonly outOfDateThreshold = 5; // In minutes;

  private clockSubscription: Subscription | undefined;

  constructor(public globalHandler: GlobalHandlerService) {}

  ngOnInit() {
    this.clockSubscription = this.globalHandler.clock$.subscribe(time => {
      const date = new Date(time*1000);

      const year    = date.getFullYear();
      const month   = date.getMonth();
      const day     = date.getDate();
      const weekDay = date.getDay();
      const hours   = date.getHours();
      const minutes = date.getMinutes();


      this.date$.next(`${WEEK_DAY_NAMES[weekDay]}, ${day} de ${MONTH_NAMES[month]} de ${year}`);
      this.clock$.next(`${hours.toFixed(0).padStart(2, '0')}:${minutes.toFixed(0).padStart(2, '0')}`);

      this.outOfDate$.next(
        Math.abs(differenceInMinutes(date, new Date())) >= this.outOfDateThreshold
      );

    });
  }

  ngOnDestroy() {
    this.clockSubscription?.unsubscribe();
  }

}
