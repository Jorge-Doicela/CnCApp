import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NormaRegulPageRoutingModule } from './norma-regul-routing.module';

import { NormaRegulPage } from './norma-regul.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NormaRegulPageRoutingModule
  ],
  declarations: [NormaRegulPage]
})
export class NormaRegulPageModule {}
