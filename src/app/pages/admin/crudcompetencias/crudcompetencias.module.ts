import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudcompetenciasPageRoutingModule } from './crudcompetencias-routing.module';

import { CrudcompetenciasPage } from './crudcompetencias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudcompetenciasPageRoutingModule
  ],
  declarations: [CrudcompetenciasPage]
})
export class CrudcompetenciasPageModule {}
