import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CertificadosService } from 'src/app/features/admin/certificados/services/certificados.service';
import { CapacitacionesService } from 'src/app/features/admin/capacitaciones/services/capacitaciones.service';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  shieldCheckmarkOutline,
  keyOutline,
  checkmarkCircle,
  alertCircle,
  calendarOutline,
  timeOutline,
  arrowBackOutline,
  cameraOutline,
  closeOutline,
  imageOutline,
  refreshOutline,
  schoolOutline,
  locationOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-validar-qr',
  templateUrl: './validar-qr.page.html',
  styleUrls: ['./validar-qr.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ValidarQrPage implements OnInit, OnDestroy {

  hashCode: string = '';
  isLoading: boolean = false;
  resultadoValidacion: boolean = false;
  esValido: boolean = false;
  mensajeValidacion: string = '';
  certificadoData: any = null;
  capacitacionData: any = null;

  // Scanner state
  mostrandoEscaner: boolean = false;
  private html5Qrcode: Html5Qrcode | null = null;
  private readonly QR_READER_ID = 'qr-reader-public';

  private certificadosService = inject(CertificadosService);
  private capacitacionesService = inject(CapacitacionesService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      shieldCheckmarkOutline,
      keyOutline,
      checkmarkCircle,
      alertCircle,
      calendarOutline,
      timeOutline,
      arrowBackOutline,
      cameraOutline,
      closeOutline,
      imageOutline,
      refreshOutline,
      schoolOutline,
      locationOutline,
      informationCircleOutline
    });
  }

  ngOnInit() {
    // Verificar si hay un hash en los parámetros de URL (para QR escaneados)
    this.route.queryParams.subscribe(params => {
      if (params['hash']) {
        this.hashCode = params['hash'];
        this.validarCertificado();
      } else {
        this.iniciarEscaner();
      }
    });
  }

  ngOnDestroy() {
    this.detenerEscaner();
  }

  // ─── Lógica del Escáner ─────────────────────────────────────────────────

  async iniciarEscaner() {
    if (this.mostrandoEscaner) return;
    
    this.mostrandoEscaner = true;
    this.resultadoValidacion = false;
    this.cdr.detectChanges();
    
    // CASE 1: NATIVE PLATFORM (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      try {
        const { camera } = await BarcodeScanner.checkPermissions();
        if (camera !== 'granted') {
          const { camera: newStatus } = await BarcodeScanner.requestPermissions();
          if (newStatus !== 'granted') {
             this.presentToast('Se requiere permiso de cámara para escanear el certificado.', 'warning');
             this.mostrandoEscaner = false;
             this.cdr.detectChanges();
             return;
          }
        }

        const isSupported = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
        if (!isSupported.available) {
          await BarcodeScanner.installGoogleBarcodeScannerModule();
        }

        const { barcodes } = await BarcodeScanner.scan({
          formats: [BarcodeFormat.QrCode]
        });

        if (barcodes && barcodes.length > 0) {
          this.ngZone.run(() => {
            this.procesarCodigoEscaneado(barcodes[0].displayValue);
          });
        } else {
          this.mostrandoEscaner = false;
        }
        this.cdr.detectChanges();
        return; // Exit native flow

      } catch (err: any) {
        console.error('[QR_VALIDAR] Native scanner error:', err);
        this.remoteLog('Native scanner failure (Public)', { message: err?.message }, 'error');
        // Fallback to web scanner
      }
    }

    // CASE 2: WEB / FALLBACK
    setTimeout(async () => {
      try {
        if (this.html5Qrcode) {
          await this.detenerEscaner();
        }
        this.html5Qrcode = new Html5Qrcode(this.QR_READER_ID);
        await this.html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText: string) => {
            this.ngZone.run(() => {
              this.procesarCodigoEscaneado(decodedText);
            });
          },
          () => {}
        );
      } catch (err: any) {
        console.error('Error al iniciar cámara:', err);

        // Remote log for debugging
        this.remoteLog('Error starting camera (Public QR)', { 
          message: err?.message, 
          name: err?.name,
          isNative: Capacitor.isNativePlatform(),
          origin: window.location.origin
        }, 'error');

        this.presentToast('No se pudo acceder a la cámara o el permiso fue denegado', 'danger');
        this.mostrandoEscaner = false;
        this.cdr.detectChanges();
      }
    }, 300);
  }

  async detenerEscaner() {
    if (this.html5Qrcode) {
      try {
        if (this.html5Qrcode.getState() === Html5QrcodeScannerState.SCANNING) {
          await this.html5Qrcode.stop();
        }
        await this.html5Qrcode.clear();
      } catch (e) {
        console.warn('Error al detener escáner:', e);
      }
      this.html5Qrcode = null;
    }
    this.mostrandoEscaner = false;
    this.cdr.detectChanges();
  }

  procesarCodigoEscaneado(text: string) {
    try {
      if (text.includes('hash=')) {
        const url = new URL(text);
        this.hashCode = url.searchParams.get('hash') || '';
      } else {
        this.hashCode = text;
      }
      
      this.detenerEscaner();
      this.validarCertificado();
    } catch (e) {
      this.hashCode = text;
      this.detenerEscaner();
      this.validarCertificado();
    }
  }

  async seleccionarImagen(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      // 1. Detener escáner de cámara si está activo
      if (this.html5Qrcode) {
        try {
          if (this.html5Qrcode.getState() === Html5QrcodeScannerState.SCANNING) {
            await this.html5Qrcode.stop();
          }
          await this.html5Qrcode.clear();
        } catch (e) {
          console.warn('Error al limpiar escáner previo:', e);
        }
        this.html5Qrcode = null;
      }

      // 2. Crear una instancia temporal para escanear el archivo (sin ID de contenedor necesario para scanFile)
      // Aunque la librería permite usar el ID, para scanFile es más limpio así si no queremos renderizar.
      // Pero para mantener compatibilidad con versiones que lo requieren, usamos el ID.
      const tempScanner = new Html5Qrcode(this.QR_READER_ID);
      
      try {
        const result = await tempScanner.scanFile(file, true);
        this.ngZone.run(() => {
          this.procesarCodigoEscaneado(result);
        });
      } finally {
        // Siempre limpiar la instancia temporal
        try { await tempScanner.clear(); } catch(e){}
      }

    } catch (err) {
      console.error('Error al escanear archivo:', err);
      this.presentToast('No se encontró un código QR válido en la imagen', 'warning');
      this.isLoading = false;
      this.mostrandoEscaner = false; // Volver al estado inicial si falla
      this.cdr.detectChanges();
    }
  }

  async validarCertificado() {
    if (!this.hashCode) return;

    try {
      this.isLoading = true;
      this.mostrandoEscaner = false;
      this.resultadoValidacion = false;
      this.certificadoData = null;
      this.capacitacionData = null;
      this.cdr.detectChanges();

      const certificado = await firstValueFrom(this.certificadosService.verifyCertificateByHash(this.hashCode));

      if (!certificado) {
        this.mensajeValidacion = 'El código no corresponde a un certificado emitido oficialmente por el CNC.';
        this.esValido = false;
      } else {
        this.certificadoData = certificado;
        this.capacitacionData = certificado.capacitacion;
        this.mensajeValidacion = 'Certificado verificado oficialmente por el Consejo Nacional de Competencias.';
        this.esValido = true;
      }
      this.resultadoValidacion = true;

    } catch (error) {
      console.error('Error en validación:', error);
      this.mensajeValidacion = 'Error al conectar con el servidor de validación.';
      this.esValido = false;
      this.resultadoValidacion = true;
      this.presentToast('Hubo un problema al verificar el certificado', 'danger');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  reiniciarBusqueda() {
    this.hashCode = '';
    this.resultadoValidacion = false;
    this.mostrandoEscaner = false;
    this.iniciarEscaner();
  }

  async obtenerDatosCapacitacion(idCapacitacion: number) {
    try {
      const data = await firstValueFrom(this.capacitacionesService.getCapacitacion(idCapacitacion)) as any;
      if (data) {
        this.capacitacionData = data;
      }
    } catch (error) {
      console.error('Error al consultar capacitación:', error);
    }
  }

  calcularDiferenciaMeses(fecha1: Date, fecha2: Date): number {
    return (fecha2.getFullYear() - fecha1.getFullYear()) * 12 +
      (fecha2.getMonth() - fecha1.getMonth());
  }

  formatearFecha(fechaISO: string): string {
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return fechaISO || 'Fecha no disponible';
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  private async remoteLog(message: string, data: any = {}, level: string = 'info') {
    try {
      await fetch(`${environment.apiUrl}/debug/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data })
      });
    } catch (e) {
      console.error('Failed to send remote log', e);
    }
  }
}
