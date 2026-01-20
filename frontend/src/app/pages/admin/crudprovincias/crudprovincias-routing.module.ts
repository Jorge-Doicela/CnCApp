import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrudprovinciasPage } from './crudprovincias.page';

const routes: Routes = [
  {
    path: '',
    component: CrudprovinciasPage
  },
  {
    path: 'crear',
    loadChildren: () => import('./crear/crear.module').then( m => m.CrearPageModule)
  },
  {
    path: 'editar/:Id_Provincia',
    loadChildren: () => import('./editar/editar.module').then( m => m.EditarPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrudprovinciasPageRoutingModule {}
