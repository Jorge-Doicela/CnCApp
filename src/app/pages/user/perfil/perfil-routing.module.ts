import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilPage } from './perfil.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilPage
  },  {
    path: 'editar',
    loadChildren: () => import('./editar/editar.module').then( m => m.EditarPageModule)
  },
  {
    path: 'firma',
    loadChildren: () => import('./firma/firma.module').then( m => m.FirmaPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilPageRoutingModule {}
