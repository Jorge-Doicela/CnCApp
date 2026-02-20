import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
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
  arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-validar-qr',
  templateUrl: './validar-qr.page.html',
  styleUrls: ['./validar-qr.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ValidarQrPage implements OnInit {

  hashCode: string = '';
  isLoading: boolean = false;
  resultadoValidacion: boolean = false;
  esValido: boolean = false;
  mensajeValidacion: string = '';
  certificadoData: any = null;
  capacitacionData: any = null;

  private certificadosService = inject(CertificadosService);
  private capacitacionesService = inject(CapacitacionesService);

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
      arrowBackOutline
    });
  }

  ngOnInit() {
    // Verificar si hay un hash en los parámetros de URL (para QR escaneados)
    this.route.queryParams.subscribe(params => {
      if (params['hash']) {
        this.hashCode = params['hash'];
        console.log('Hash recibido:', this.hashCode);
        this.validarCertificado();
      }
    });
  }

  async validarCertificado() {
    if (!this.hashCode) {
      this.presentToast('Ingrese un código de verificación válido', 'warning');
      return;
    }

    try {
      this.isLoading = true;
      this.resultadoValidacion = false;

      // Mostrar cargador
      const loading = await this.loadingController.create({
        message: 'Verificando certificado...',
        spinner: 'crescent'
      });
      await loading.present();

      console.log('Buscando certificado con hash:', this.hashCode);

      // Verify Hash via Service
      // Assuming existing service method verifyHash signature needs adjustment or we use it as is?
      // Service method: verifyHash(idUsuario: string, idCapacitacion: number)
      // Wait, the current page validates by HASH.
      // The service method seems to verify by IDs.
      // I need to add a method verifyByHash(hash: string) to CertificadosService.
      // Assuming I'll add it or it exists (I'll add it via edit if needed, but let's assume I add it now).

      // Since I can't edit the service in the middle of this file write, I will assume the service has it or I need to update the service first.
      // Actually I should have updated the service first. I will assume I will update it in next step or I can use the HTTP client directly if blocked, but better to update service.

      // Let's rely on `certificadosService.verifyCertificateByHash(this.hashCode)` which I should create.
      const certificado = await firstValueFrom(this.certificadosService.verifyCertificateByHash(this.hashCode));

      if (!certificado) {
        this.mensajeValidacion = 'No se encontró ningún certificado con este código de verificación.';
        this.esValido = false;
        this.resultadoValidacion = true;
        await loading.dismiss();
        this.isLoading = false;
        return;
      }

      // Obtener los datos del certificado
      this.certificadoData = certificado;

      // Verificar si el certificado ha expirado (opcional)
      const fechaGenerado = new Date(this.certificadoData.Fecha_generado);
      const fechaActual = new Date();
      const diferenciaMeses = this.calcularDiferenciaMeses(fechaGenerado, fechaActual);

      if (diferenciaMeses > 24) { // Expiración después de 2 años
        this.mensajeValidacion = 'Este certificado ha expirado. Los certificados tienen una validez de 2 años desde su emisión.';
        this.esValido = false;
        this.resultadoValidacion = true;
        await loading.dismiss();
        this.isLoading = false;
        return;
      }

      // Obtener información de la capacitación
      if (this.certificadoData.Id_Capacitacion) {
        await this.obtenerDatosCapacitacion(this.certificadoData.Id_Capacitacion);
      }

      // Certificado válido
      this.mensajeValidacion = 'Este certificado es auténtico y ha sido emitido por el Consejo Nacional de Competencias.';
      this.esValido = true;
      this.resultadoValidacion = true;

      await loading.dismiss();
      this.isLoading = false;

    } catch (error) {
      console.error('Error en la validación:', error);
      this.mensajeValidacion = 'Ocurrió un error durante la verificación o el certificado no es válido.';
      this.esValido = false;
      this.resultadoValidacion = true;

      const loadingElement = await this.loadingController.getTop();
      if (loadingElement) {
        await this.loadingController.dismiss();
      }

      this.isLoading = false;
    }
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
}
