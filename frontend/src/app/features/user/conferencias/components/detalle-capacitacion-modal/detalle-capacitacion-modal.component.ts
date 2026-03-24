import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, ModalController, IonList, IonItem, IonLabel, IonBadge, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, videocamOutline, locationOutline, timeOutline, documentTextOutline, calendarOutline, checkmarkCircleOutline, ribbonOutline, playCircleOutline, alertCircleOutline } from 'ionicons/icons';
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
      <!-- 1. HERO SECTION -->
      <div class="modal-hero">
        <div class="hero-bg-accent"></div>
        <div class="status-container animate-fade-up">
           <div class="luxury-badge" [ngClass]="{
            'badge-pendiente': estadoReal === 'Pendiente' || estadoReal === 'Próximamente' || estadoReal === 'Aprobada',
            'badge-finalizada': estadoReal === 'Finalizada',
            'badge-curso': estadoReal === 'En Curso'
          }">
             <ion-icon [name]="estadoReal === 'Finalizada' ? 'checkmark-circle' : (estadoReal === 'En Curso' ? 'play-circle' : 'time')"></ion-icon>
             {{ estadoReal }}
           </div>
        </div>
        <h2 class="animate-fade-up" style="animation-delay: 0.1s;">{{ capacitacion?.nombre }}</h2>
        <div class="type-pill animate-fade-up" style="animation-delay: 0.15s;">
          <ion-icon name="layers-outline"></ion-icon>
          {{ capacitacion?.modalidad }}
        </div>
      </div>

      <div class="content-container">
        <!-- 2. BENTO INFO GRID -->
        <div class="bento-grid">
          <div class="bento-card long animate-fade-up" style="animation-delay: 0.2s;">
            <div class="card-icon"><ion-icon name="calendar-outline"></ion-icon></div>
            <div class="card-info">
              <label>Fecha del Evento</label>
              <p>{{ capacitacion?.fechaInicio | date:'fullDate' }}</p>
            </div>
          </div>

          <div class="bento-card small animate-fade-up" style="animation-delay: 0.25s;">
            <div class="card-icon"><ion-icon name="time-outline"></ion-icon></div>
            <div class="card-info">
              <label>Horario</label>
              <p>{{ capacitacion?.horaInicio }} - {{ capacitacion?.horaFin }}</p>
            </div>
          </div>

          <div class="bento-card small highlight animate-fade-up" style="animation-delay: 0.3s;">
            <div class="card-icon"><ion-icon name="ribbon-outline"></ion-icon></div>
            <div class="card-info">
              <label>Horas</label>
              <p>{{ capacitacion?.horas }}</p>
            </div>
          </div>

          <div class="bento-card wide animate-fade-up" style="animation-delay: 0.35s;">
            <div class="card-icon"><ion-icon name="location-outline"></ion-icon></div>
            <div class="card-info">
              <label>Ubicación / Sede</label>
              <p>{{ capacitacion?.lugar }}</p>
            </div>
            <div class="status-dot green"></div>
          </div>
        </div>

        <!-- 3. DESCRIPTION SECTION -->
        <div class="description-section animate-fade-up" style="animation-delay: 0.4s;">
          <div class="section-title">
            <div class="line"></div>
            <h3>Detalles del Programa</h3>
          </div>
          <p>{{ capacitacion?.descripcion || 'No se han cargado detalles adicionales técnicos para esta sesión.' }}</p>
        </div>

        <!-- 4. VIRTUAL ACCESS CTA -->
        <div class="virtual-access-premium animate-fade-up" *ngIf="capacitacion?.modalidad === 'Virtual' || capacitacion?.modalidad === 'PRESENCIAL Y VIRTUAL'" style="animation-delay: 0.45s;">
          <div class="virtual-inner" *ngIf="capacitacion?.enlaceVirtual">
            <div class="virtual-text">
              <ion-icon name="videocam-outline"></ion-icon>
              <div>
                <h4>Acceso al Aula Virtual</h4>
                <span>La sesión iniciará según el horario establecido.</span>
              </div>
            </div>
            <ion-button (click)="openVirtualLink()" class="luxury-btn">
               Ingresar ahora
            </ion-button>
          </div>
          
          <div class="virtual-placeholder" *ngIf="!capacitacion?.enlaceVirtual">
            <ion-icon name="lock-closed-outline"></ion-icon>
            <p>El enlace de Zoom/Teams se habilitará 15 minutos antes del inicio de la capacitación.</p>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border premium-footer">
      <ion-button (click)="close()" class="footer-btn">
         Cerrar Detalles
      </ion-button>
    </ion-footer>
  `,
  styles: [`
    :host { --ion-background-color: #fdfdfd; font-family: 'Inter', sans-serif; }
    
    .premium-header {
      background: white;
      ion-toolbar { --background: transparent; --min-height: 60px; }
      ion-title { font-weight: 900; letter-spacing: -0.04em; color: #1e293b; text-align: center; font-size: 1.1rem; }
      .close-btn { --color: #94a3b8; --background: rgba(0,0,0,0.02); --border-radius: 50%; width: 32px; height: 32px; }
    }

    .glass-modal-content { --padding-top: 0; }

    .modal-hero {
      padding: 50px 24px 40px;
      text-align: center;
      position: relative;
      background: linear-gradient(to bottom, #f8fafc 0%, white 100%);
      overflow: hidden;

      .hero-bg-accent {
        position: absolute;
        top: -100px; left: 50%; transform: translateX(-50%);
        width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
        pointer-events: none;
      }
      
      .status-container { margin-bottom: 24px; display: flex; justify-content: center; }
      .luxury-badge {
        padding: 8px 18px; border-radius: 14px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase;
        letter-spacing: 0.08em; display: inline-flex; align-items: center; gap: 8px;
        box-shadow: 0 4px 15px -4px rgba(0,0,0,0.08); background: white; border: 1px solid rgba(0,0,0,0.03);
        
        &.badge-pendiente { color: #b45309; }
        &.badge-finalizada { color: #10b981; }
        &.badge-curso { color: #3b82f6; }
      }

      h2 { font-size: 2.1rem; font-weight: 950; color: #0f172a; letter-spacing: -0.05em; line-height: 1.1; margin: 0 0 24px; }
      .type-pill {
        display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
        background: #f1f5f9; color: #475569; border-radius: 20px; font-size: 0.85rem; font-weight: 800;
        border: 1px solid rgba(0,0,0,0.02);
      }
    }

    .content-container { padding: 0 24px 40px; }

    /* BENTO GRID */
    .bento-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto;
      gap: 16px;
      margin-bottom: 40px;

      .bento-card {
        background: white; border: 1px solid rgba(0,0,0,0.04); border-radius: 28px; padding: 20px;
        display: flex; flex-direction: column; gap: 16px; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        
        &:hover { transform: scale(1.02); border-color: rgba(30, 58, 138, 0.1); }
        &.long { grid-column: span 2; flex-direction: row; align-items: center; }
        &.wide { grid-column: span 2; flex-direction: row; align-items: center; justify-content: space-between; overflow: hidden; position: relative;}
        &.highlight { background: #eff6ff; border-color: #dbeafe; .card-icon { background: #dbeafe; color: #1e40af; } }

        .card-icon { width: 44px; height: 44px; border-radius: 14px; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #64748b; }
        .card-info {
          label { display: block; font-size: 0.65rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          p { font-size: 1.05rem; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.2; }
        }

        .status-dot { width: 10px; height: 10px; border-radius: 50%; opacity: 0.5; &.green { background: #10b981; box-shadow: 0 0 10px #10b981; } }
      }
    }

    .description-section {
      margin-bottom: 40px;
      .section-title {
        display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
        .line { width: 30px; height: 3px; background: #3b82f6; border-radius: 4px; }
        h3 { font-size: 0.9rem; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
      }
      p { font-size: 1.05rem; color: #4b5563; line-height: 1.7; font-weight: 500; }
    }

    .virtual-access-premium {
      .virtual-inner {
        background: #0f172a; border-radius: 32px; padding: 24px; color: white; display: flex; flex-direction: column; gap: 24px;
        box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.4);
        
        .virtual-text {
          display: flex; align-items: center; gap: 16px;
          ion-icon { font-size: 1.8rem; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 16px; }
          h4 { margin: 0; font-size: 1.2rem; font-weight: 900; }
          span { font-size: 0.85rem; color: rgba(255,255,255,0.5); font-weight: 600; }
        }
        .luxury-btn { --background: #3b82f6; --color: white; --border-radius: 16px; margin: 0; height: 50px; font-weight: 900; --box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
      }
      .virtual-placeholder {
        display: flex; align-items: center; gap: 16px; padding: 20px; background: #f8fafc; border-radius: 20px; border: 1px dashed #cbd5e1;
        ion-icon { font-size: 1.5rem; color: #94a3b8; }
        p { margin: 0; font-size: 0.85rem; font-weight: 600; color: #64748b; line-height: 1.4; }
      }
    }

    .premium-footer {
       padding: 24px; background: white; border-top: 1px solid rgba(0,0,0,0.03);
       .footer-btn { --background: #f1f5f9; --color: #475569; --border-radius: 16px; font-weight: 900; text-transform: none; margin: 0; height: 50px; }
    }

    .animate-fade-up { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DetalleCapacitacionModalComponent {
  @Input() capacitacion?: Capacitacion;
  @Input() inscripcion?: any;
  @Input() estadoReal: string = 'Pendiente';
  
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ 
      closeOutline, videocamOutline, locationOutline, timeOutline, 
      documentTextOutline, calendarOutline, checkmarkCircleOutline,
      ribbonOutline, playCircleOutline, alertCircleOutline
    });
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
