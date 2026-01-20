import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ValidarQrPageRoutingModule } from './validar-qr-routing.module';

import { ValidarQrPage } from './validar-qr.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ValidarQrPageRoutingModule
  ],
  declarations: [ValidarQrPage]
})
export class ValidarQrPageModule {}
