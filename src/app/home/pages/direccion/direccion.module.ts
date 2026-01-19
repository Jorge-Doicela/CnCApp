import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { DireccionPageRoutingModule } from './direccion-routing.module';
import { DireccionPage } from './direccion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    DireccionPageRoutingModule
  ],
  declarations: [DireccionPage]
})
export class DireccionPageModule {}
