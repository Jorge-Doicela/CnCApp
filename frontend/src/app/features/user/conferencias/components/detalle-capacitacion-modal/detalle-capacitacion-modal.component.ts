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
    <ion-header class="ion-no-border premium-header">
      <ion-toolbar>
        <ion-title>Detalles del Curso</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()" class="close-btn">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="glass-modal-content">
      <div class="modal-hero animate-fade-up">
        <span class="modal-eyebrow">Información General</span>
        <h2>{{ capacitacion?.nombre }}</h2>
        <div class="pill-badge">{{ capacitacion?.modalidad }}</div>
      </div>

      <div class="content-container animate-fade-up" style="animation-delay: 0.1s;">
        <!-- INFO CARDS GRID -->
        <div class="info-grid-premium">
          <div class="glass-info-card">
            <div class="icon-box"><ion-icon name="calendar-outline"></ion-icon></div>
            <div class="text">
              <small>Fecha de Inicio</small>
              <p>{{ capacitacion?.fechaInicio | date:'longDate' }}</p>
            </div>
          </div>

          <div class="glass-info-card">
            <div class="icon-box"><ion-icon name="time-outline"></ion-icon></div>
            <div class="text">
              <small>Horario</small>
              <p>{{ capacitacion?.horaInicio }} - {{ capacitacion?.horaFin }}</p>
            </div>
          </div>

          <div class="glass-info-card highlighted">
            <div class="icon-box"><ion-icon name="ribbon-outline"></ion-icon></div>
            <div class="text">
              <small>Certificación</small>
              <p>{{ capacitacion?.horas }} Horas Avaladas</p>
            </div>
          </div>

          <div class="glass-info-card">
            <div class="icon-box"><ion-icon name="location-outline"></ion-icon></div>
            <div class="text">
              <small>Ubicación / Sede</small>
              <p>{{ capacitacion?.lugar }}</p>
            </div>
          </div>
        </div>

        <div class="description-section">
          <h3>Descripción del Programa</h3>
          <p>{{ capacitacion?.descripcion || 'No se ha proporcionado una descripción detallada aún.' }}</p>
        </div>

        <!-- ACTION AREA -->
        <div class="virtual-cta animate-fade-up" *ngIf="capacitacion?.modalidad === 'Virtual' && capacitacion?.enlaceVirtual" style="animation-delay: 0.2s;">
            <div class="cta-inner">
               <ion-icon name="videocam-outline" class="cta-icon"></ion-icon>
               <div class="cta-text">
                  <h4>Aula Virtual Disponible</h4>
                  <p>Accede directamente a la sesión en vivo.</p>
               </div>
               <ion-button (click)="openVirtualLink()" class="cta-btn">
                  Entrar Ahora
               </ion-button>
            </div>
        </div>

        <div class="no-link-warning" *ngIf="capacitacion?.modalidad === 'Virtual' && !capacitacion?.enlaceVirtual">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <p>El enlace de acceso será habilitado por tu instructor minutos antes del inicio.</p>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border premium-footer">
      <ion-button expand="block" (click)="close()" fill="clear" class="footer-close-btn">
        Entendido, Volver
      </ion-button>
    </ion-footer>
  `,
  styles: [`
    :host { --ion-background-color: #f8fafc; }
    
    .premium-header {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      ion-toolbar { --background: transparent; --min-height: 70px; }
      ion-title { font-weight: 850; letter-spacing: -0.02em; color: #0f172a; text-align: center; }
      .close-btn { --color: #64748b; --background: rgba(0,0,0,0.03); --border-radius: 50%; }
    }

    .glass-modal-content {
       --padding-top: 0;
       background: #f8fafc;
    }

    .modal-hero {
      padding: 40px 24px 30px;
      background: white;
      border-bottom: 1px solid #f1f5f9;
      text-align: center;
      
      .modal-eyebrow { font-size: 0.75rem; font-weight: 850; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px; }
      h2 { font-size: 1.8rem; font-weight: 900; color: #0f172a; letter-spacing: -0.03em; line-height: 1.25; margin: 0 0 16px; }
      .pill-badge { display: inline-block; padding: 6px 14px; background: #eff6ff; color: #1e40af; border-radius: 99px; font-size: 0.75rem; font-weight: 750; }
    }

    .content-container { padding: 24px; }

    .info-grid-premium {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 30px;
    }

    .glass-info-card {
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 20px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      
      .icon-box { width: 40px; height: 40px; border-radius: 12px; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #1e3a8a; }
      .text {
         small { display: block; font-size: 0.65rem; font-weight: 750; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
         p { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin: 0; line-height: 1.3; }
      }

      &.highlighted { border-color: #bae6fd; background: #f0f9ff; .icon-box { background: #e0f2fe; } }
    }

    .description-section {
       margin-bottom: 30px;
       h3 { font-size: 1rem; font-weight: 850; color: #0f172a; margin-bottom: 10px; }
       p { font-size: 0.95rem; color: #475569; line-height: 1.6; }
    }

    .virtual-cta {
       background: #1e3a8a;
       border-radius: 24px;
       padding: 20px;
       color: white;
       box-shadow: 0 15px 30px -10px rgba(30, 58, 138, 0.3);
       
       .cta-inner { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
       .cta-icon { font-size: 2.2rem; background: rgba(255,255,255,0.2); border-radius: 14px; padding: 8px; }
       .cta-text {
          flex: 1; min-width: 150px;
          h4 { margin: 0; font-size: 1.1rem; font-weight: 800; }
          p { margin: 2px 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.7); font-weight: 500; }
       }
       .cta-btn { --background: white; --color: #1e3a8a; --border-radius: 12px; font-weight: 850; margin: 0; width: 100%; margin-top: 10px; }
    }

    .no-link-warning {
       display: flex; gap: 12px; padding: 16px; background: #fff7ed; border-radius: 16px; border: 1px solid #ffedd5;
       ion-icon { font-size: 1.4rem; color: #9a3412; }
       p { font-size: 0.85rem; color: #9a3412; font-weight: 500; margin: 0; line-height: 1.4; }
    }

    .premium-footer { background: #f8fafc; .footer-close-btn { --color: #64748b; font-weight: 700; } }

    .animate-fade-up { opacity: 0; animation: fadeUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
