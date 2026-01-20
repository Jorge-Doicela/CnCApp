import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudentidadesPageRoutingModule } from './crudentidades-routing.module';

import { CrudentidadesPage } from './crudentidades.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudentidadesPageRoutingModule
  ],
  declarations: [CrudentidadesPage]
})
export class CrudentidadesPageModule {}
