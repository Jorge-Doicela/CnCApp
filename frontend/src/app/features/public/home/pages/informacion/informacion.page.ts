import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonAvatar,
  IonAccordionGroup, IonAccordion, IonItem,
  IonIcon, IonLabel,
  IonSegment, IonSegmentButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  earthOutline, checkmarkCircleOutline, peopleOutline,
  documentTextOutline, swapHorizontalOutline, businessOutline,
  ribbonOutline, barChartOutline, peopleCircleOutline, informationCircleOutline,
  gitNetworkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.page.html',
  styleUrls: ['./informacion.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton,
    IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonAvatar,
    IonAccordionGroup, IonAccordion, IonItem,
    IonIcon, IonLabel,
    IonSegment, IonSegmentButton
  ]
})
export class InformacionPage implements OnInit {
  selectedSegment = 'general';

  constructor() {
    addIcons({
      'earth-outline': earthOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'people-outline': peopleOutline,
      'document-text-outline': documentTextOutline,
      'swap-horizontal-outline': swapHorizontalOutline,
      'business-outline': businessOutline,
      'ribbon-outline': ribbonOutline,
      'bar-chart-outline': barChartOutline,
      'people-circle-outline': peopleCircleOutline,
      'information-circle-outline': informationCircleOutline,
      'git-network-outline': gitNetworkOutline
    });
  }

  ngOnInit() {
  }

  // Método para abrir documentos adicionales
  abrirDocumento(url: string) {
    window.open(url, '_blank');
  }

  // Método para mostrar más información sobre un miembro del consejo
  verDetalleMiembro(id: number) {
    // Esta función podría expandirse para mostrar un modal con más información
    console.log('Ver detalles del miembro:', id);
  }
}
