import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { supabase } from 'src/supabase';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-validar-qr',
  templateUrl: './validar-qr.page.html',
  styleUrls: ['./validar-qr.page.scss'],
  standalone: false
})
export class ValidarQrPage implements OnInit {

  hashCode: string = '';
  isLoading: boolean = false;
  resultadoValidacion: boolean = false;
  esValido: boolean = false;
  mensajeValidacion: string = '';
  certificadoData: any = null;
  capacitacionData: any = null;

  constructor(
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

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

      // Consultar la base de datos para el hash proporcionado
      const { data: certificados, error } = await supabase
        .from('Certificados')
        .select('*, Usuario!Certificados_Id_Usuario_fkey(Nombre_Usuario)')
        .eq('Hash', this.hashCode)
        .limit(1);

      if (error) {
        console.error('Error al consultar certificado:', error);
        this.mensajeValidacion = 'Error al verificar el certificado. Intente nuevamente.';
        this.esValido = false;
        this.resultadoValidacion = true;
        await loading.dismiss();
        this.isLoading = false;
        return;
      }

      console.log('Resultado de la consulta:', certificados);

      if (!certificados || certificados.length === 0) {
        this.mensajeValidacion = 'No se encontró ningún certificado con este código de verificación.';
        this.esValido = false;
        this.resultadoValidacion = true;
        await loading.dismiss();
        this.isLoading = false;
        return;
      }

      // Obtener los datos del certificado
      this.certificadoData = certificados[0];

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
      this.mensajeValidacion = 'Ocurrió un error durante la verificación. Por favor, intente nuevamente.';
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
      const { data, error } = await supabase
        .from('Capacitaciones')
        .select('Nombre_Capacitacion, Horas, Modalidades')
        .eq('Id_Capacitacion', idCapacitacion)
        .single();

      if (error) {
        console.error('Error al obtener datos de capacitación:', error);
        return;
      }

      this.capacitacionData = data;
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
