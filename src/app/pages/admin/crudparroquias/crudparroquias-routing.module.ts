import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrudparroquiasPage } from './crudparroquias.page';

const routes: Routes = [
  {
    path: '',
    component: CrudparroquiasPage
  },
  {
    path: 'crear',
    loadChildren: () => import('./crear/crear.module').then( m => m.CrearPageModule)
  },
  {
    path: 'editar/:Id_Parroquia',
    loadChildren: () => import('./editar/editar.module').then( m => m.EditarPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrudparroquiasPageRoutingModule {}
