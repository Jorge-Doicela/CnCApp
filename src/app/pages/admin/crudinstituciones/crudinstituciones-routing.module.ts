import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrudinstitucionesPage } from './crudinstituciones.page';

const routes: Routes = [
  {
    path: '',
    component: CrudinstitucionesPage
  },
  {
    path: 'crear',
    loadChildren: () => import('./crear/crear.module').then( m => m.CrearPageModule)
  },
  {
    path: 'editar/:idInstitucion',
    loadChildren: () => import('./editar/editar.module').then( m => m.EditarPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrudinstitucionesPageRoutingModule {}
