import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-conferencias',
  templateUrl: './conferencias.page.html',
  styleUrls: ['./conferencias.page.scss'],
  standalone: false
})
export class ConferenciasPage implements OnInit {
  Capacitaciones: any[] = [];
  CapacitacionesFiltradas: any[] = [];
  cargando: boolean = true;
  searchTerm: string = '';
  filtroEstado: string = 'todos';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.cargarCapacitaciones();
  }

  async cargarCapacitaciones() {
    const loading = await this.loadingController.create({
      message: 'Cargando conferencias...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.RecuperarCapacitaciones();
      this.presentToast('Conferencias cargadas correctamente', 'success');
    } catch (error: any) {
      this.presentToast('Error al cargar conferencias: ' + error.message, 'danger');
    } finally {
      this.cargando = false;
      loading.dismiss();
    }
  }

  async obtenerIdUsuarioActivo() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      this.presentToast('Error al obtener el usuario activo: ' + error.message, 'danger');
      return null;
    }

    if (data && data.user) {
      const idUsuario = data.user.id;
      return this.obtenerIdUsuario(idUsuario);
    } else {
      this.presentToast('No hay usuario activo', 'warning');
      return null;
    }
  }

  async obtenerIdUsuario(idUsuario: string) {
    let { data: Usuario, error } = await supabase
      .from('Usuario')
      .select('Id_Usuario')
      .eq('auth_uid', idUsuario);

    if (error) {
      this.presentToast('Error al obtener el usuario: ' + error.message, 'danger');
      return null;
    }

    if (Usuario && Usuario.length > 0) {
      return Usuario[0].Id_Usuario;
    } else {
      this.presentToast('No se encontró el usuario', 'warning');
      return null;
    }
  }

  async RecuperarCapacitaciones() {
    const Id_Usuario = await this.obtenerIdUsuarioActivo();

    if (Id_Usuario) {
      const { data: inscripciones, error: errorInscripciones } = await supabase
        .from('Usuarios_Capacitaciones')
        .select('Id_Capacitacion')
        .eq('Id_Usuario', Id_Usuario);

      if (errorInscripciones) {
        this.presentToast('Error al obtener las inscripciones: ' + errorInscripciones.message, 'danger');
        return;
      }

      if (!inscripciones || inscripciones.length === 0) {
        this.Capacitaciones = [];
        this.CapacitacionesFiltradas = [];
        return;
      }

      const capacitacionesIds = inscripciones.map((inscripcion: any) => inscripcion.Id_Capacitacion);

      const { data: capacitaciones, error: errorCapacitaciones } = await supabase
        .from('Capacitaciones')
        .select('*')
        .in('Id_Capacitacion', capacitacionesIds);

      if (errorCapacitaciones) {
        this.presentToast('Error al obtener las capacitaciones: ' + errorCapacitaciones.message, 'danger');
        return;
      }

      this.Capacitaciones = capacitaciones ?? [];
      this.filtrarCapacitaciones();
    } else {
      this.presentToast('No hay usuario activo', 'warning');
    }
  }

  filtrarCapacitaciones() {
    this.CapacitacionesFiltradas = this.Capacitaciones.filter(capacitacion => {
      // Filtrar por término de búsqueda
      const matchesSearchTerm = this.searchTerm.trim() === '' ||
        capacitacion.Nombre_Capacitacion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        capacitacion.Descripcion_Capacitacion.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtrar por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        capacitacion.Estado.toString() === this.filtroEstado;

      return matchesSearchTerm && matchesEstado;
    });
  }

  getCapacitacionesPorEstado(estado: number): number {
    return this.Capacitaciones.filter(cap => cap.Estado === estado).length;
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
