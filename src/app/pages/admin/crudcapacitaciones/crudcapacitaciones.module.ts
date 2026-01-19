import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudcapacitacionesPageRoutingModule } from './crudcapacitaciones-routing.module';

import { CrudcapacitacionesPage } from './crudcapacitaciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudcapacitacionesPageRoutingModule
  ],
  declarations: [CrudcapacitacionesPage]
})
export class CrudcapacitacionesPageModule {}
