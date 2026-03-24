import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectorRef, ChangeDetectionStrategy,
  ElementRef, ViewChild, AfterViewInit, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CapacitacionesService, ConfirmarAsistenciaQRResult } from '../../admin/capacitaciones/services/capacitaciones.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

type EstadoConfirmacion = 'inicial' | 'escaneando' | 'exito' | 'ya_confirmado' | 'error';

@Component({
  selector: 'app-confirmar-asistencia-qr',
  templateUrl: './confirmar-asistencia-qr.page.html',
  styleUrls: ['./confirmar-asistencia-qr.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmarAsistenciaQrPage implements OnInit, OnDestroy {
  @ViewChild('qrReader', { static: false }) qrReaderRef!: ElementRef;

  estado: EstadoConfirmacion = 'inicial';
  resultadoCapacitacion: ConfirmarAsistenciaQRResult['capacitacion'] | null = null;
  mensajeError = '';
  procesando = false;
  camaraDisponible = true;
  escaneando = false;

  private html5Qrcode: Html5Qrcode | null = null;
  private readonly QR_READER_ID = 'qr-reader-element';

  private capacitacionesService = inject(CapacitacionesService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  constructor(
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    // Verificar si hay un parámetro QR en la URL (deep links futuros)
    const urlParams = new URLSearchParams(window.location.search);
    const qrParam = urlParams.get('qr');
    if (qrParam) {
      this.procesarCodigo(qrParam);
    }
  }

  ngOnDestroy() {
    this.detenerEscaner();
  }

  // ─── Iniciar escáner de cámara ──────────────────────────────────────────
  async iniciarEscaner() {
    if (this.escaneando) return;

    this.estado = 'escaneando';
    this.escaneando = true;
    this.cdr.detectChanges(); 

    // Check permissions explicitly if on native mobile
    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await Camera.checkPermissions();
        if (perm.camera !== 'granted') {
          const request = await Camera.requestPermissions();
          if (request.camera !== 'granted') {
             this.mostrarToast('Permiso de cámara necesario para escanear', 'warning');
             this.estado = 'inicial';
             this.escaneando = false;
             this.cdr.detectChanges();
             return;
          }
        }
      } catch (e) {
        console.warn('[QR_ASISTENCIA] Error verificando permisos nativos:', e);
      }
    }

    // Pequeño delay para asegurar que el div esté en el DOM antes de montar el scanner
    await this.delay(300);

    try {
      if (this.html5Qrcode) {
        await this.detenerEscaner();
      }
      
      this.html5Qrcode = new Html5Qrcode(this.QR_READER_ID);

      await this.html5Qrcode.start(
        { facingMode: 'environment' }, 
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0
        },
        (decodedText: string) => {
          this.ngZone.run(async () => {
            await this.detenerEscaner();
            await this.procesarCodigo(decodedText);
          });
        },
        (_error: any) => {
          // Errores de frame ignorados
        }
      );

    } catch (err: any) {
      console.error('[QR_ASISTENCIA] Error starting scanner:', err);
      this.estado = 'inicial';
      this.escaneando = false;

      if (err?.message?.includes('Permission') || err?.message?.includes('NotAllowed')) {
        this.camaraDisponible = false;
        this.mostrarToast('Permiso de cámara denegado.', 'warning');
      } else {
        this.mostrarToast('No se pudo iniciar la cámara.', 'danger');
      }
      this.cdr.detectChanges();
    }
  }

  async detenerEscaner() {
    if (this.html5Qrcode) {
      try {
        const state = this.html5Qrcode.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await this.html5Qrcode.stop();
        }
        await this.html5Qrcode.clear();
      } catch (e) {
        console.warn('[QR_ASISTENCIA] Error stopping scanner:', e);
      }
      this.html5Qrcode = null;
    }
    this.escaneando = false;
    this.cdr.detectChanges();
  }

  // ─── Cancelar escaneo y volver al inicio ────────────────────────────────
  async cancelarEscaneo() {
    await this.detenerEscaner();
    this.estado = 'inicial';
    this.cdr.detectChanges();
  }

  // ─── Procesar el código leído (QR o manual) ─────────────────────────────
  async procesarCodigo(codigo: string) {
    const codigoLimpio = codigo?.trim();
    if (!codigoLimpio) {
      this.mostrarToast('Código vacío o inválido', 'warning');
      return;
    }

    this.procesando = true;
    this.cdr.markForCheck();

    const loading = await this.loadingController.create({
      message: 'Confirmando asistencia...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const resultado = await firstValueFrom(
        this.capacitacionesService.confirmarAsistenciaQR(codigoLimpio)
      );

      this.resultadoCapacitacion = resultado.capacitacion;
      this.estado = resultado.yaConfirmado ? 'ya_confirmado' : 'exito';

    } catch (error: any) {
      this.estado = 'error';
      this.mensajeError = ErrorHandlerUtil.getErrorMessage(error);
    } finally {
      loading.dismiss();
      this.procesando = false;
      this.cdr.detectChanges();
    }
  }

  // ─── Reiniciar todo ─────────────────────────────────────────────────────
  async reiniciar() {
    await this.detenerEscaner();
    this.estado = 'inicial';
    this.resultadoCapacitacion = null;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  volver() {
    this.router.navigate(['/ver-conferencias']);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3500,
      position: 'top',
      color,
      buttons: [{ text: 'Cerrar', role: 'cancel' }]
    });
    await toast.present();
  }
}
