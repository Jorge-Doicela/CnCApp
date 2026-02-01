import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  shieldCheckmarkOutline, peopleOutline, ribbonOutline,
  bodyOutline, businessOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-historia',
  templateUrl: './historia.page.html',
  styleUrls: ['./historia.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton,
    IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoriaPage implements OnInit {

  constructor() {
    addIcons({
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'people-outline': peopleOutline,
      'ribbon-outline': ribbonOutline,
      'body-outline': bodyOutline,
      'business-outline': businessOutline
    });
  }

  ngOnInit() {
  }

  // Método para abrir documentos históricos (podría expandirse según necesidades)
  abrirDocumento(url: string) {
    window.open(url, '_blank');
  }
}
