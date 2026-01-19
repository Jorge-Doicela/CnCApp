import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudinstitucionesPageRoutingModule } from './crudinstituciones-routing.module';

import { CrudinstitucionesPage } from './crudinstituciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudinstitucionesPageRoutingModule
  ],
  declarations: [CrudinstitucionesPage]
})
export class CrudinstitucionesPageModule {}
