import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrudcantonesPage } from './crudcantones.page';

const routes: Routes = [
  {
    path: '',
    component: CrudcantonesPage
  },
  {
    path: 'crear',
    loadChildren: () => import('./crear/crear.module').then( m => m.CrearPageModule)
  },
  {
    path: 'editar/:Id_Canton',
    loadChildren: () => import('./editar/editar.module').then( m => m.EditarPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrudcantonesPageRoutingModule {}
