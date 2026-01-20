// crudcapacitaciones.page.ts
import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crudcapacitaciones',
  templateUrl: './crudcapacitaciones.page.html',
  styleUrls: ['./crudcapacitaciones.page.scss'],
  standalone: false
})
export class CrudcapacitacionesPage implements OnInit {
  Capacitaciones: any[] = [];
  capacitacionesFiltradas: any[] = [];

  // Filtros
  filtroEstado: string = 'todos';
  ordenarPor: string = 'fecha_desc';
  terminoBusqueda: string = '';
  cargando: boolean = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.RecuperarCapacitaciones();
  }

  // Recupera las capacitaciones
  async RecuperarCapacitaciones() {
    const loading = await this.loadingController.create({
      message: 'Cargando capacitaciones...',
      spinner: 'crescent'
    });
    await loading.present();
    this.cargando = true;

    try {
      const { data, error } = await supabase.from('Capacitaciones').select('*');

      if (error) {
        console.error('Error al obtener capacitaciones:', error.message);
        this.presentToast('Error al cargar capacitaciones', 'danger');
        return;
      }

      this.Capacitaciones = data || [];
      this.aplicarFiltros();
    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.presentToast('Error al cargar datos', 'danger');
    } finally {
      this.cargando = false;
      loading.dismiss();
    }
  }

  // Aplicar filtros a las capacitaciones
  aplicarFiltros() {
    let resultado = [...this.Capacitaciones];

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(cap => cap.Estado.toString() === this.filtroEstado);
    }

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      resultado = resultado.filter(cap =>
        cap.Nombre_Capacitacion.toLowerCase().includes(termino) ||
        cap.Descripcion_Capacitacion.toLowerCase().includes(termino) ||
        cap.Lugar_Capacitacion.toLowerCase().includes(termino)
      );
    }

    // Ordenar resultados
    switch(this.ordenarPor) {
      case 'fecha_asc':
        resultado.sort((a, b) => new Date(a.Fecha_Capacitacion).getTime() - new Date(b.Fecha_Capacitacion).getTime());
        break;
      case 'fecha_desc':
        resultado.sort((a, b) => new Date(b.Fecha_Capacitacion).getTime() - new Date(a.Fecha_Capacitacion).getTime());
        break;
      case 'nombre':
        resultado.sort((a, b) => a.Nombre_Capacitacion.localeCompare(b.Nombre_Capacitacion));
        break;
    }

    this.capacitacionesFiltradas = resultado;
  }

  // Limpiar todos los filtros
  limpiarFiltros() {
    this.filtroEstado = 'todos';
    this.ordenarPor = 'fecha_desc';
    this.terminoBusqueda = '';
    this.aplicarFiltros();
  }

  // Obtener el texto del estado según el valor numérico
  getEstadoTexto(estado: number): string {
    switch(estado) {
      case 0: return 'Pendiente';
      case 1: return 'Realizada';
      case 2: return 'Cancelada';
      default: return 'Desconocido';
    }
  }

  // Estadísticas
  obtenerCapacitacionesPendientes(): number {
    return this.Capacitaciones.filter(cap => cap.Estado === 0).length;
  }

  obtenerCapacitacionesRealizadas(): number {
    return this.Capacitaciones.filter(cap => cap.Estado === 1).length;
  }

  obtenerCertificadosEmitidos(): number {
    return this.Capacitaciones.filter(cap => cap.Certificado === true).length;
  }

  // Navegación
  iraCrearCapacitacion() {
    this.router.navigate(['/gestionar-capacitaciones/crear']);
  }

  iraEditarCapacitacion(Id_Capacitacion: number) {
    this.router.navigate(['/gestionar-capacitaciones/editar', Id_Capacitacion]);
  }

  iraVisualizarinscritos(Id_Capacitacion: number) {
    this.router.navigate(['/gestionar-capacitaciones/visualizarinscritos', Id_Capacitacion]);
  }

  // Finalizar capacitación (nueva funcionalidad)
  async finalizarCapacitacion(Id_Capacitacion: number) {
    const alert = await this.alertController.create({
      header: 'Finalizar Capacitación',
      message: '¿Está seguro que desea marcar esta capacitación como finalizada? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Finalizar',
          handler: () => {
            this.marcarComoFinalizada(Id_Capacitacion);
          }
        }
      ]
    });

    await alert.present();
  }

  async marcarComoFinalizada(Id_Capacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Finalizando capacitación...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data, error } = await supabase
        .from('Capacitaciones')
        .update({ Estado: 1 })
        .eq('Id_Capacitacion', Id_Capacitacion)
        .select();

      if (error) {
        console.error('Error al finalizar la capacitación:', error);
        this.presentToast('Error al finalizar la capacitación', 'danger');
        return;
      }

      this.presentToast('Capacitación finalizada exitosamente', 'success');
      this.RecuperarCapacitaciones();
    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.presentToast('Error al actualizar el estado', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Eliminar capacitación
  async confirmarEliminar(Id_Capacitacion: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro de eliminar esta capacitación? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarCapacitacion(Id_Capacitacion);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarCapacitacion(Id_Capacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Eliminando capacitación...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Primero eliminar registros relacionados en la tabla de unión
      const { error: errorUsuarios } = await supabase
        .from('Usuarios_Capacitaciones')
        .delete()
        .eq('Id_Capacitacion', Id_Capacitacion);

      if (errorUsuarios) {
        console.error('Error al eliminar registros de usuarios:', errorUsuarios);
        this.presentToast('Error al eliminar usuarios asociados', 'danger');
        return;
      }

      // Luego eliminar la capacitación
      const { error } = await supabase
        .from('Capacitaciones')
        .delete()
        .eq('Id_Capacitacion', Id_Capacitacion);

      if (error) {
        console.error('Error al eliminar capacitación:', error);
        this.presentToast('Error al eliminar la capacitación', 'danger');
        return;
      }

      // Actualizar la lista
      this.presentToast('Capacitación eliminada correctamente', 'success');
      this.RecuperarCapacitaciones();
    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.presentToast('Error al eliminar datos', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Generación de certificados
  async mostrarConfirmacion(Id_Capacitacion: number) {
    // Obtener usuarios que no asistieron
    const usuariosNoAsistieron = await this.obtenerUsuariosNoAsistieron(Id_Capacitacion);

    const alert = await this.alertController.create({
      header: 'Confirmar emisión de certificados',
      message: `Se va a emitir el certificado para esta capacitación. Los usuarios que no asistieron (${usuariosNoAsistieron.length}) serán eliminados de la lista y no recibirán certificados. Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Emitir certificados',
          handler: () => {
            this.eliminarNoAsistieron(Id_Capacitacion);
            this.iraGenerarCertificado(Id_Capacitacion);
          }
        }
      ]
    });

    await alert.present();
  }

  async obtenerUsuariosNoAsistieron(Id_Capacitacion: number) {
    const { data, error } = await supabase
      .from('Usuarios_Capacitaciones')
      .select('Id_Usuario')
      .eq('Id_Capacitacion', Id_Capacitacion)
      .eq('Asistencia', false);

    if (error) {
      console.error('Error al obtener usuarios sin asistencia:', error);
      return [];
    }

    return data || [];
  }

  async eliminarNoAsistieron(Id_Capacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Procesando usuarios sin asistencia...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data, error } = await supabase
        .from('Usuarios_Capacitaciones')
        .delete()
        .eq('Id_Capacitacion', Id_Capacitacion)
        .eq('Asistencia', false);

      if (error) {
        console.error('Error al eliminar usuarios sin asistencia:', error);
        this.presentToast('Error al procesar usuarios sin asistencia', 'danger');
      } else {
        console.log('Usuarios sin asistencia eliminados:', data);
        // Corregimos el acceso a data.length con una verificación más segura
        const eliminados = data && typeof data === 'object' && 'length' in data ? (data as any[]).length : 0;
        this.presentToast(`Se han eliminado ${eliminados} usuarios sin asistencia`, 'success');
      }
    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.presentToast('Error al procesar datos', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async iraGenerarCertificado(Id_Capacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Emitiendo certificados...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data, error } = await supabase
        .from('Capacitaciones')
        .update({ Certificado: true })
        .eq('Id_Capacitacion', Id_Capacitacion)
        .select();

      if (error) {
        console.error('Error al emitir el certificado:', error);
        this.presentToast('Error al emitir certificados', 'danger');
      } else {
        console.log('Certificado emitido con éxito:', data);
        this.presentToast('Certificados emitidos correctamente', 'success');
        this.RecuperarCapacitaciones();
      }
    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.presentToast('Error al procesar certificados', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
