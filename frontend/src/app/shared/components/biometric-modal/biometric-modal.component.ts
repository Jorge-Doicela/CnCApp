import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonContent, IonIcon, IonInput, IonSpinner 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  shieldCheckmarkOutline, fingerPrintOutline, personOutline, 
  lockClosedOutline, eyeOutline, eyeOffOutline, checkmarkCircle 
} from 'ionicons/icons';
import { BiometriaService } from 'src/app/core/services/biometria.service';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-biometric-modal',
  template: `
    <ion-modal [isOpen]="isOpen" (didDismiss)="onDismiss()" class="premium-bio-modal">
      <ng-template>
        <div class="bio-modal-wrapper" [class.success-state]="activacionExitosa">
          <div class="bio-modal-header animate-scale-in">
            <div class="bio-icon-container" [class.success-pulse]="activacionExitosa">
              <ion-icon [name]="activacionExitosa ? 'checkmark-circle' : biometriaService.platformIcon()"></ion-icon>
              <div class="bio-pulse" [class.success]="activacionExitosa"></div>
            </div>
            <h2>{{ activacionExitosa ? '¡Éxito!' : biometriaService.platformLabel() }}</h2>
            <p>{{ activacionExitosa 
              ? 'Biometría configurada correctamente en este dispositivo.' 
              : 'Para habilitar el acceso biométrico, por favor confirma tu contraseña.' }}</p>
          </div>

          <div class="bio-modal-body" *ngIf="!activacionExitosa">
            <div class="premium-input-group">
              <ion-icon name="lock-closed-outline" class="input-icon-left"></ion-icon>
              <ion-input 
                [type]="verPassword ? 'text' : 'password'" 
                placeholder="Contraseña actual" 
                [(ngModel)]="passVerificacion"
                class="premium-input">
              </ion-input>
              <ion-button fill="clear" (click)="verPassword = !verPassword" class="eye-toggle">
                <ion-icon [name]="verPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
              </ion-button>
            </div>
          </div>

          <div class="bio-modal-footer">
            <button *ngIf="!activacionExitosa" 
                    class="modal-btn-confirm" 
                    (click)="confirmar()" 
                    [disabled]="verificando || !passVerificacion">
              <span *ngIf="!verificando">ACTIVAR AHORA</span>
              <ion-spinner *ngIf="verificando" name="crescent"></ion-spinner>
            </button>
            <button class="modal-btn-cancel" (click)="cerrar()">
              {{ activacionExitosa ? 'CERRAR' : 'CANCELAR' }}
            </button>
          </div>
        </div>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    /* Reutilizamos los estilos premium del perfil para consistencia */
    .premium-bio-modal {
      --height: auto;
      --max-height: 90%;
      --border-radius: 32px;
      --backdrop-opacity: 0.6;
      --background: transparent;
      align-items: center;
    }
    .bio-modal-wrapper {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 32px;
      padding: 32px 24px;
      width: 95vw;
      max-width: 400px;
      margin: auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .bio-modal-header {
      text-align: center;
      .bio-icon-container {
        width: 80px; height: 80px; margin: 0 auto 20px;
        background: white; border-radius: 24px;
        display: flex; align-items: center; justify-content: center;
        font-size: 2.5rem; position: relative;
        box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        color: #1e3a8a;
        &.success-pulse { color: #10b981; background: #f0fdf4; }
        .bio-pulse {
          position: absolute; width: 100%; height: 100%; border-radius: 24px;
          border: 2px solid currentColor; animation: pulse-ring 2s infinite; opacity: 0.5;
          &.success { border-color: #10b981; }
        }
      }
      h2 { font-weight: 800; font-size: 1.5rem; color: #1e293b; margin: 0 0 8px 0; }
      p { font-size: 0.9rem; color: #64748b; margin: 0; line-height: 1.5; }
    }
    .premium-input-group {
      position: relative; background: white; border-radius: 16px; border: 1px solid #e2e8f0;
      display: flex; align-items: center; padding: 4px 8px; transition: all 0.3s ease;
      &:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
      .input-icon-left { font-size: 1.2rem; color: #94a3b8; margin-left: 8px; flex-shrink: 0; }
      .premium-input { --padding-start: 8px; font-weight: 600; color: #1e293b; font-size: 1rem; --background: transparent; }
      .eye-toggle { margin: 0; --color: #94a3b8; font-size: 1.2rem; flex-shrink: 0; }
    }
    .bio-modal-footer {
      display: flex; flex-direction: column; gap: 12px;
      button { height: 54px; border-radius: 16px; font-weight: 700; font-size: 0.9rem; letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s ease; }
      .modal-btn-confirm {
        background: #1e3a8a; color: white; border: none; display: flex; align-items: center; justify-content: center; gap: 10px;
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(30,58,138,0.25); }
      }
      .modal-btn-cancel { background: transparent; color: #64748b; border: 1px solid #e2e8f0; &:hover { background: #f8fafc; } }
    }
    @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.3); opacity: 0; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  `],
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    IonModal, IonIcon, IonInput, IonButton, IonSpinner
  ]
})
export class BiometricModalComponent {
  @Input() isOpen: boolean = false;
  @Output() didDismiss = new EventEmitter<boolean>();
  
  public biometriaService = inject(BiometriaService);
  private toastController = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  passVerificacion: string = '';
  verificando: boolean = false;
  verPassword: boolean = false;
  activacionExitosa: boolean = false;

  constructor() {
    addIcons({ 
      shieldCheckmarkOutline, fingerPrintOutline, personOutline, 
      lockClosedOutline, eyeOutline, eyeOffOutline, checkmarkCircle 
    });
  }

  async confirmar() {
    this.verificando = true;
    try {
      const result = await this.biometriaService.activate(this.passVerificacion);
      if (result.success) {
        this.activacionExitosa = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.isOpen = false;
          this.didDismiss.emit(true);
          this.reset();
        }, 1500);
      } else {
        this.presentToast(result.message || 'Error al activar biometría', 'danger');
      }
    } catch (e) {
      this.presentToast('Error inesperado', 'danger');
    } finally {
      this.verificando = false;
      this.cdr.detectChanges();
    }
  }

  cerrar() {
    this.isOpen = false;
    this.didDismiss.emit(false);
    this.reset();
  }

  onDismiss() {
    this.reset();
    this.didDismiss.emit(false);
  }

  private reset() {
    this.passVerificacion = '';
    this.verificando = false;
    this.activacionExitosa = false;
    this.verPassword = false;
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
