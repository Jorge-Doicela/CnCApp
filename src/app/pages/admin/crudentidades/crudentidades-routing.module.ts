import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrudentidadesPage } from './crudentidades.page';

const routes: Routes = [
  {
    path: '',
    component: CrudentidadesPage
  },
  {
    path: 'crear',
    loadChildren: () => import('./crear/crear.module').then( m => m.CrearPageModule)
  },
  {
    path: 'editar/:id',  
    loadChildren: () => import('./editar/editar.module').then(m => m.EditarPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrudentidadesPageRoutingModule {}
