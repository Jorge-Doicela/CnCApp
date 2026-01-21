import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-conferencias',
  templateUrl: './conferencias.page.html',
  styleUrls: ['./conferencias.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ConferenciasPage implements OnInit {
  Capacitaciones: any[] = []; // Array to store trainings
  loading: boolean = true;
  userProfile: any = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    try {
      // Mock data loading or fetch from backend
      // const authUid = localStorage.getItem('auth_uid');
      // if (authUid) {
      //     this.userProfile = await this.http.get(...)
      // }
      // For now, empty
      this.Capacitaciones = [];
      this.loading = false;
    } catch (error) {
      console.error('Error loading data', error);
      this.loading = false;
    }
  }

  getCapacitacionesConCertificado(): number {
    return this.Capacitaciones.filter(cap => cap.Certificado === true).length;
  }

  async verDetallesCapacitacion(capacitacion: any) {
    const alert = await this.alertController.create({
      header: capacitacion.Nombre_Capacitacion,
      subHeader: `Fecha: ${this.formatearFecha(capacitacion.Fecha_Capacitacion)}`,
      message: `
        <div style="text-align: left;">
          <p><strong>Descripción:</strong> ${capacitacion.Descripcion_Capacitacion}</p>
          <p><strong>Modalidad:</strong> ${capacitacion.Modalidades}</p>
          <p><strong>Duración:</strong> ${capacitacion.Horas} horas</p>
          <p><strong>Estado:</strong> ${this.obtenerEstadoTexto(capacitacion.Estado)}</p>
        </div>
      `,
      buttons: ['OK']
    });

    await alert.present();
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerEstadoTexto(estado: number): string {
    switch (estado) {
      case 0: return 'Pendiente';
      case 1: return 'Completada';
      case 2: return 'Cancelada';
      default: return 'Desconocido';
    }
  }

  // Método mejorado para la navegación a la pantalla de certificados
  iraGenerarCertificado(Id_Capacitacion: number) {
    console.log('Navegando a certificado con ID:', Id_Capacitacion);

    try {
      // Navegar a la ruta de certificados con el ID como parámetro
      this.router.navigate(['/certificados', Id_Capacitacion]);
    } catch (error) {
      console.error('Error al navegar a certificados:', error);
      this.presentToast('Error al acceder al certificado', 'danger');
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
          side: 'end',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
