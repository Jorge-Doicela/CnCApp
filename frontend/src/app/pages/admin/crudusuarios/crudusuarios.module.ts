import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CRUDUsuariosPageRoutingModule } from './crudusuarios-routing.module';

import { CRUDUsuariosPage } from './crudusuarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CRUDUsuariosPageRoutingModule
  ],
  declarations: [CRUDUsuariosPage]
})
export class CRUDUsuariosPageModule {}
