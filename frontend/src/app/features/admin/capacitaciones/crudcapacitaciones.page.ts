import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CapacitacionesService } from './services/capacitaciones.service';
import { Capacitacion } from '../../../core/models/capacitacion.interface';

@Component({
  selector: 'app-crudcapacitaciones',
  templateUrl: './crudcapacitaciones.page.html',
  styleUrls: ['./crudcapacitaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudcapacitacionesPage implements OnInit {
  Capacitaciones: Capacitacion[] = [];
  capacitacionesFiltradas: Capacitacion[] = [];

  // Filtros
  filtroEstado: string = 'todos';
  ordenarPor: string = 'fecha_desc';
  terminoBusqueda: string = '';
  cargando: boolean = false;

  private capacitacionesService = inject(CapacitacionesService);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.RecuperarCapacitaciones();
  }

  ionViewWillEnter() {
    this.RecuperarCapacitaciones();
  }

  async RecuperarCapacitaciones() {
    const loading = await this.loadingController.create({
      message: 'Cargando capacitaciones...',
      spinner: 'crescent'
    });
    await loading.present();
    this.cargando = true;

    try {
      const data = await firstValueFrom(this.capacitacionesService.getCapacitaciones());
      this.Capacitaciones = data || [];
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error al obtener capacitaciones:', error);
      this.presentToast('Error al cargar capacitaciones (API)', 'danger');
    } finally {
      this.cargando = false;
      loading.dismiss();
      this.cdr.markForCheck();
    }
  }

  // Aplicar filtros a las capacitaciones
  aplicarFiltros() {
    let resultado = [...this.Capacitaciones];

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(cap => cap.estado === this.filtroEstado);
    }

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      resultado = resultado.filter(cap =>
        cap.nombre.toLowerCase().includes(termino) ||
        (cap.descripcion && cap.descripcion.toLowerCase().includes(termino)) ||
        (cap.lugar && cap.lugar.toLowerCase().includes(termino))
      );
    }

    // Ordenar resultados
    switch (this.ordenarPor) {
      case 'fecha_asc':
        resultado.sort((a, b) => new Date(a.fechaInicio || 0).getTime() - new Date(b.fechaInicio || 0).getTime());
        break;
      case 'fecha_desc':
        resultado.sort((a, b) => new Date(b.fechaInicio || 0).getTime() - new Date(a.fechaInicio || 0).getTime());
        break;
      case 'nombre':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
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

  // Obtener el texto del estado (Simplemente retornar el string o mapear si es necesario)
  getEstadoTexto(estado: string): string {
    return estado;
  }

  // Estadísticas
  obtenerCapacitacionesPendientes(): number {
    return this.Capacitaciones.filter(cap => cap.estado === 'Activa').length;
  }

  obtenerCapacitacionesRealizadas(): number {
    return this.Capacitaciones.filter(cap => cap.estado === 'Finalizada').length;
  }

  obtenerCertificadosEmitidos(): number {
    return this.Capacitaciones.filter(cap => cap.certificado === true).length;
  }

  // Navegación
  iraCrearCapacitacion() {
    this.router.navigate(['/gestionar-capacitaciones/crear']);
  }

  iraEditarCapacitacion(Id_Capacitacion: number) {
    this.router.navigate(['/gestionar-capacitaciones/editar', Id_Capacitacion]);
  }

  iraVisualizarinscritos(Id_Capacitacion: number) {
    this.router.navigate(['/gestionar-capacitaciones/visualizar-inscritos', Id_Capacitacion]);
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
      await firstValueFrom(this.capacitacionesService.updateCapacitacion(Id_Capacitacion, { estado: 'Finalizada' }));
      this.presentToast('Capacitación finalizada exitosamente', 'success');
      this.RecuperarCapacitaciones();
    } catch (error) {
      console.error('Error al finalizar la capacitación:', error);
      this.presentToast('Error al finalizar la capacitación', 'danger');
    } finally {
      loading.dismiss();
      this.cdr.markForCheck();
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
      await firstValueFrom(this.capacitacionesService.deleteCapacitacion(Id_Capacitacion));
      this.presentToast('Capacitación eliminada correctamente', 'success');
      this.RecuperarCapacitaciones();
    } catch (error) {
      console.error('Error al eliminar capacitación:', error);
      this.presentToast('Error al eliminar la capacitación', 'danger');
    } finally {
      loading.dismiss();
      this.cdr.markForCheck();
    }
  }

  // Generación de certificados
  async mostrarConfirmacion(Id_Capacitacion: number) {
    try {
      const usuariosNoAsistieron = await firstValueFrom(this.capacitacionesService.getUsuariosNoAsistieron(Id_Capacitacion));
      const alert = await this.alertController.create({
        header: 'Confirmar emisión de certificados',
        message: `Se va a emitir el certificado para esta capacitación.Los usuarios que no asistieron(${usuariosNoAsistieron.length}) serán eliminados de la lista y no recibirán certificados.Esta acción no se puede deshacer.`,
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
    } catch (error) {
      console.error('Error fetching non-attending users:', error);
      this.presentToast('Error al verificar asistencia', 'danger');
    } finally {
      this.cdr.markForCheck();
    }
  }

  async eliminarNoAsistieron(Id_Capacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Procesando usuarios sin asistencia...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const response = await firstValueFrom(this.capacitacionesService.deleteUsuariosNoAsistieron(Id_Capacitacion));
      console.log('Usuarios sin asistencia eliminados:', response);
      this.presentToast(`Se han eliminado usuarios sin asistencia`, 'success');
    } catch (error) {
      console.error('Error al eliminar usuarios sin asistencia:', error);
      this.presentToast('Error al procesar usuarios sin asistencia', 'danger');
    } finally {
      loading.dismiss();
      this.cdr.markForCheck();
    }
  }

  async iraGenerarCertificado(Id_Capacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Emitiendo certificados...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await firstValueFrom(this.capacitacionesService.updateCapacitacion(Id_Capacitacion, { certificado: true }));
      this.presentToast('Certificados emitidos correctamente', 'success');
      this.RecuperarCapacitaciones();
    } catch (error) {
      console.error('Error al emitir el certificado:', error);
      this.presentToast('Error al emitir certificados', 'danger');
    } finally {
      loading.dismiss();
      this.cdr.markForCheck();
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
