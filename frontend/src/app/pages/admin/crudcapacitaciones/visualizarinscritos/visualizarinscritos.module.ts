import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisualizarinscritosPageRoutingModule } from './visualizarinscritos-routing.module';

import { VisualizarinscritosPage } from './visualizarinscritos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisualizarinscritosPageRoutingModule
  ],
  declarations: [VisualizarinscritosPage]
})
export class VisualizarinscritosPageModule {}
