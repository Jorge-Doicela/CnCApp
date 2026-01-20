import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NormaRegulPage } from './norma-regul.page';

const routes: Routes = [
  {
    path: '',
    component: NormaRegulPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NormaRegulPageRoutingModule {}
