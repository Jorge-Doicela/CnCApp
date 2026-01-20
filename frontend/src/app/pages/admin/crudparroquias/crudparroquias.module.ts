import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudparroquiasPageRoutingModule } from './crudparroquias-routing.module';

import { CrudparroquiasPage } from './crudparroquias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudparroquiasPageRoutingModule
  ],
  declarations: [CrudparroquiasPage]
})
export class CrudparroquiasPageModule {}
