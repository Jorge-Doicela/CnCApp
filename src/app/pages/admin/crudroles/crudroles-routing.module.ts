import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CRUDRolesPage } from './crudroles.page';

const routes: Routes = [
  {
    path: '',
    component: CRUDRolesPage
  },
  {
    path: 'crear',
    loadChildren: () => import('./crear/crear.module').then( m => m.CrearPageModule)
  },
  {
    path: 'editar/:idRol',
    loadChildren: () => import('./editar/editar.module').then( m => m.EditarPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CRUDRolesPageRoutingModule {}
