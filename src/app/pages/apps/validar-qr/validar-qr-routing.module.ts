import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ValidarQrPage } from './validar-qr.page';

const routes: Routes = [
  {
    path: '',
    component: ValidarQrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ValidarQrPageRoutingModule {}
