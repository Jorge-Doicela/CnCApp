import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudcantonesPageRoutingModule } from './crudcantones-routing.module';

import { CrudcantonesPage } from './crudcantones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudcantonesPageRoutingModule
  ],
  declarations: [CrudcantonesPage]
})
export class CrudcantonesPageModule {}
