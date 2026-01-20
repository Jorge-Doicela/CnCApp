import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudprovinciasPageRoutingModule } from './crudprovincias-routing.module';

import { CrudprovinciasPage } from './crudprovincias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudprovinciasPageRoutingModule
  ],
  declarations: [CrudprovinciasPage]
})
export class CrudprovinciasPageModule {}
