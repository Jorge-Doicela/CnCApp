import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConferenciasPageRoutingModule } from './conferencias-routing.module';

import { ConferenciasPage } from './conferencias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConferenciasPageRoutingModule
  ],
  declarations: [ConferenciasPage]
})
export class ConferenciasPageModule {}
