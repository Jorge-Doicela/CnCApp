import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConferenciasPage } from './conferencias.page';

const routes: Routes = [
  {
    path: '',
    component: ConferenciasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConferenciasPageRoutingModule {}
