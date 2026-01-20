import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisualizarinscritosPage } from './visualizarinscritos.page';

const routes: Routes = [
  {
    path: '',
    component: VisualizarinscritosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisualizarinscritosPageRoutingModule {}
