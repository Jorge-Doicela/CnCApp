import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CRUDRolesPageRoutingModule } from './crudroles-routing.module';

import { CRUDRolesPage } from './crudroles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CRUDRolesPageRoutingModule
  ],
  declarations: [CRUDRolesPage]
})
export class CRUDRolesPageModule {}
