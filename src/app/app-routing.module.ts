import { InitialConnectionGuardGuard } from './guards/initial-connection-guard.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path      : '',
    redirectTo: 'loading',
    pathMatch : 'full'
  },
  {
    path        : 'loading',
    loadChildren: () => import('./pages/loading/loading.module').then( m => m.LoadingPageModule)
  },
  {
    path        : 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate : [InitialConnectionGuardGuard]
  },
  {
    path        : 'irrigation-groups',
    loadChildren: () => import('./pages/irrigation-groups/irrigation-groups.module').then( m => m.IrrigationGroupsPageModule),
    canActivate : [InitialConnectionGuardGuard]
  },
  {
    path        : 'irrigation-group',
    loadChildren: () => import('./pages/irrigation-group/irrigation-group.module').then( m => m.IrrigationGroupPageModule),
    canActivate : [InitialConnectionGuardGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
