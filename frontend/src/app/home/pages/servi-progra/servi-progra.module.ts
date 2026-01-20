import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServiPrograPageRoutingModule } from './servi-progra-routing.module';

import { ServiPrograPage } from './servi-progra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServiPrograPageRoutingModule
  ],
  declarations: [ServiPrograPage]
})
export class ServiPrograPageModule {}
