import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons,
  IonTitle, IonContent, IonIcon, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  shieldCheckmarkOutline, peopleOutline, ribbonOutline,
  bodyOutline, businessOutline, arrowBackOutline,
  calendarOutline, medalOutline, sparklesOutline,
  bookOutline, rocketOutline, globeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-historia',
  templateUrl: './historia.page.html',
  styleUrls: ['./historia.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons,
    IonTitle, IonContent, IonIcon, IonButton,
    RouterLink
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
      'business-outline': businessOutline,
      'arrow-back-outline': arrowBackOutline,
      'calendar-outline': calendarOutline,
      'medal-outline': medalOutline,
      'sparkles-outline': sparklesOutline,
      'book-outline': bookOutline,
      'rocket-outline': rocketOutline,
      'globe-outline': globeOutline
    });
  }

  ngOnInit() {
  }

  // Método para abrir documentos históricos (podría expandirse según necesidades)
  abrirDocumento(url: string) {
    window.open(url, '_blank');
  }
}
