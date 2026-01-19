import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrudcargosinstitucionesPage } from './crudcargosinstituciones.page';

const routes: Routes = [
  {
    path: '',
    component: CrudcargosinstitucionesPage
  },  {
    path: 'crear',
    loadChildren: () => import('./crear/crear.module').then( m => m.CrearPageModule)
  },
  {
    path: 'editar',
    loadChildren: () => import('./editar/editar.module').then( m => m.EditarPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrudcargosinstitucionesPageRoutingModule {}
