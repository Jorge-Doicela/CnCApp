import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, ModalController, IonList, IonItem, IonLabel, IonBadge, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, videocamOutline, locationOutline, timeOutline, documentTextOutline, calendarOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Capacitacion } from 'src/app/core/models/capacitacion.interface';

@Component({
  selector: 'app-detalle-capacitacion-modal',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonBadge, IonFooter],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>Detalles del Curso</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="header-info">
        <h3>{{ capacitacion?.nombre }}</h3>
        <ion-badge color="tertiary">{{ capacitacion?.modalidad }}</ion-badge>
      </div>

      <ion-list lines="full">
        <ion-item>
          <ion-icon name="document-text-outline" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>Descripción</h3>
            <p>{{ capacitacion?.descripcion || 'Sin descripción' }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-icon name="calendar-outline" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>Fecha de Inicio</h3>
            <p>{{ capacitacion?.fechaInicio | date:'longDate' }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-icon name="time-outline" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>Horario y Duración</h3>
            <p>{{ capacitacion?.horaInicio }} - {{ capacitacion?.horaFin }} ({{ capacitacion?.horas }} horas)</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-icon name="location-outline" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>Lugar / Plataforma</h3>
            <p>{{ capacitacion?.lugar }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="inscripcion">
          <ion-icon name="checkmark-circle-outline" slot="start" color="success"></ion-icon>
          <ion-label>
            <h3>Estado de Inscripción</h3>
            <p>{{ inscripcion.estadoInscripcion }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div class="virtual-action" *ngIf="capacitacion?.modalidad === 'Virtual' && capacitacion?.enlaceVirtual">
        <ion-button expand="block" (click)="openVirtualLink()" color="success">
          <ion-icon name="videocam-outline" slot="start"></ion-icon>
          Entrar al Aula Virtual
        </ion-button>
        <p class="enlace-hint">Haz clic para entrar directamente a la clase.</p>
      </div>
      
      <div class="virtual-action empty" *ngIf="capacitacion?.modalidad === 'Virtual' && !capacitacion?.enlaceVirtual">
        <p class="warning-text">El enlace al aula virtual aún no ha sido configurado por el administrador.</p>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border ion-padding">
      <ion-button expand="block" fill="outline" (click)="close()">Cerrar</ion-button>
    </ion-footer>
  `,
  styles: [`
    .header-info {
      margin-bottom: 20px;
      h3 { font-weight: 800; margin-bottom: 8px; font-size: 1.4rem; color: #1e293b; }
    }
    ion-item { --padding-start: 0; margin-bottom: 10px; }
    ion-label h3 { font-weight: 700; color: #64748b; margin-bottom: 4px; }
    ion-label p { color: #1e293b; font-size: 1rem; line-height: 1.5; white-space: normal; }
    .virtual-action {
      margin-top: 30px;
      padding: 20px;
      background: #f0fdf4;
      border-radius: 16px;
      border: 1px solid #dcfce7;
      text-align: center;
      
      ion-button { --border-radius: 12px; font-weight: 700; margin-bottom: 12px; }
      .enlace-hint { font-size: 0.85rem; color: #166534; margin: 0; }
      
      &.empty { background: #fffbeb; border-color: #fef3c7; }
      .warning-text { color: #92400e; font-size: 0.9rem; font-weight: 500; margin: 0; }
    }
  `]
})
export class DetalleCapacitacionModalComponent {
  @Input() capacitacion?: Capacitacion;
  @Input() inscripcion?: any;
  
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ closeOutline, videocamOutline, locationOutline, timeOutline, documentTextOutline, calendarOutline, checkmarkCircleOutline });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  openVirtualLink() {
    if (this.capacitacion?.enlaceVirtual) {
      window.open(this.capacitacion.enlaceVirtual, '_blank');
    }
  }
}
