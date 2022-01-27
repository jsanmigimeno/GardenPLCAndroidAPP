import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { CommunicatorService, ConnectionState } from 'src/app/services/communicator.service';

@Injectable({
  providedIn: 'root'
})
export class InitialConnectionGuardGuard implements CanActivate {
  constructor(
    private navController : NavController,
    private communicator  : CommunicatorService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const connectionState = this.communicator.connectionState$.getValue();
      if (
        connectionState === ConnectionState.connecting ||
        connectionState === ConnectionState.connectingFailed
      ) {
        this.navController.navigateRoot('/loading');
        return false;
      }
    return true;
  }

}
