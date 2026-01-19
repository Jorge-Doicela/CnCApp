import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrudcapacitacionesPage } from './crudcapacitaciones.page';

const routes: Routes = [
  {
    path: '',
    component: CrudcapacitacionesPage
  },
  {
    path: 'crear',
    loadChildren: () => import('./crear/crear.module').then( m => m.CrearPageModule)
  },
  {
    path: 'editar/:Id_Capacitacion',
    loadChildren: () => import('./editar/editar.module').then( m => m.EditarPageModule)
  },
  {
    path: 'visualizarinscritos/:Id_Capacitacion',
    loadChildren: () => import('./visualizarinscritos/visualizarinscritos.module').then( m => m.VisualizarinscritosPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrudcapacitacionesPageRoutingModule {}
