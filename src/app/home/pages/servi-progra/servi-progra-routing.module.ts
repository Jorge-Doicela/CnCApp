import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServiPrograPage } from './servi-progra.page';

const routes: Routes = [
  {
    path: '',
    component: ServiPrograPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiPrograPageRoutingModule {}
