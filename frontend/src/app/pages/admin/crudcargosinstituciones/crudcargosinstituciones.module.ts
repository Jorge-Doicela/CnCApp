import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudcargosinstitucionesPageRoutingModule } from './crudcargosinstituciones-routing.module';

import { CrudcargosinstitucionesPage } from './crudcargosinstituciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudcargosinstitucionesPageRoutingModule
  ],
  declarations: [CrudcargosinstitucionesPage]
})
export class CrudcargosinstitucionesPageModule {}
