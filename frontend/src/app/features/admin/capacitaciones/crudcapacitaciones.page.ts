import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CapacitacionesService } from './services/capacitaciones.service';
import { Capacitacion } from '../../../core/models/capacitacion.interface';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { EstadoCapacitacionEnum } from 'src/app/shared/constants/enums';
import { AuthService } from 'src/app/features/auth/services/auth.service';

import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, shieldCheckmark, addCircleOutline, school, 
  trendingUpOutline, calendar, timeOutline, checkmarkDoneCircle, 
  ribbonOutline, ribbon, sparklesOutline, searchOutline, options, 
  optionsOutline, chevronDownOutline, locationOutline, calendarClearOutline, 
  videocamOutline, people, createOutline, peopleOutline, checkmarkDoneOutline, 
  trashBinOutline, ellipse, checkmarkCircle, eyeOutline, closeOutline,
  linkOutline, time, businessOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-crudcapacitaciones',
  templateUrl: './crudcapacitaciones.page.html',
  styleUrls: ['./crudcapacitaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudcapacitacionesPage implements OnInit {
  Capacitaciones: Capacitacion[] = [];
  capacitacionesFiltradas: Capacitacion[] = [];
  selectedCapacitacion: Capacitacion | null = null;
  isModalOpen: boolean = false;

  // Filtros
  filtroEstado: string = 'todos';
  filtroModalidad: string = 'todos';
  filtroCertificados: string = 'todos';
  fechaDesde: string = '';
  fechaHasta: string = '';
  ordenarPor: string = 'fecha_desc';
  terminoBusqueda: string = '';
  cargando: boolean = false;
  mostrarFiltrosAvanzados: boolean = false;

  private capacitacionesService = inject(CapacitacionesService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isConferencista = this.authService.roleName() === 'Conferencista';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({
      chevronBackOutline, shieldCheckmark, addCircleOutline, school,
      trendingUpOutline, calendar, timeOutline, checkmarkDoneCircle,
      ribbonOutline, ribbon, sparklesOutline, searchOutline, options,
      optionsOutline, chevronDownOutline, locationOutline, calendarClearOutline,
      videocamOutline, people, createOutline, peopleOutline, checkmarkDoneOutline,
      trashBinOutline, ellipse, checkmarkCircle, eyeOutline, closeOutline,
      linkOutline, time, businessOutline
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.RecuperarCapacitaciones();
  }

  async RecuperarCapacitaciones() {
    this.cargando = true;
    this.cdr.markForCheck();

    try {
      const data = await firstValueFrom(this.capacitacionesService.getCapacitaciones());
      this.Capacitaciones = data || [];
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error al obtener capacitaciones:', error);
      this.presentToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  // Aplicar filtros a las capacitaciones
  aplicarFiltros() {
    let resultado = [...this.Capacitaciones];

    // 1. Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(cap => cap.estado === this.filtroEstado);
    }

    // 2. Filtrar por modalidad
    if (this.filtroModalidad !== 'todos') {
      resultado = resultado.filter(cap => cap.modalidad === this.filtroModalidad);
    }

    // 3. Filtrar por certificados emitidos
    if (this.filtroCertificados !== 'todos') {
      const emitido = this.filtroCertificados === 'si';
      resultado = resultado.filter(cap => cap.certificado === emitido);
    }

    // 4. Filtrar por rango de fechas
    if (this.fechaDesde) {
      const d = new Date(this.fechaDesde).getTime();
      resultado = resultado.filter(cap => new Date(cap.fechaInicio || 0).getTime() >= d);
    }
    if (this.fechaHasta) {
      const h = new Date(this.fechaHasta).getTime();
      resultado = resultado.filter(cap => new Date(cap.fechaInicio || 0).getTime() <= h);
    }

    // 5. Filtrar por término de búsqueda
    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      resultado = resultado.filter(cap =>
        cap.nombre.toLowerCase().includes(termino) ||
        (cap.descripcion && cap.descripcion.toLowerCase().includes(termino)) ||
        (cap.lugar && cap.lugar.toLowerCase().includes(termino))
      );
    }

    // 6. Ordenar resultados
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
      case 'cupos':
        resultado.sort((a, b) => (b.cuposDisponibles || 0) - (a.cuposDisponibles || 0));
        break;
    }

    this.capacitacionesFiltradas = resultado;
    this.cdr.markForCheck();
  }

  // Limpiar todos los filtros
  limpiarFiltros() {
    this.filtroEstado = 'todos';
    this.filtroModalidad = 'todos';
    this.filtroCertificados = 'todos';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.ordenarPor = 'fecha_desc';
    this.terminoBusqueda = '';
    this.aplicarFiltros();
  }

  // Obtener el texto del estado
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case EstadoCapacitacionEnum.PENDIENTE: return 'Pendiente';
      case EstadoCapacitacionEnum.REALIZADA: return 'Realizada';
      case EstadoCapacitacionEnum.CANCELADA: return 'Cancelada';
      default: return estado;
    }
  }

  // Estadísticas
  obtenerCapacitacionesPendientes(): number {
    return this.Capacitaciones.filter(cap => cap.estado === EstadoCapacitacionEnum.PENDIENTE).length;
  }

  obtenerCapacitacionesRealizadas(): number {
    return this.Capacitaciones.filter(cap => cap.estado === EstadoCapacitacionEnum.REALIZADA).length;
  }

  obtenerCertificadosEmitidos(): number {
    return this.Capacitaciones.filter(cap => cap.certificado === true).length;
  }

  // Navegación
  iraCrearCapacitacion() {
    const prefix = this.router.url.includes('/conferencista/') ? '/conferencista' : '';
    this.router.navigate([`${prefix}/gestionar-capacitaciones/crear`]);
  }

  iraEditarCapacitacion(id: number) {
    const prefix = this.router.url.includes('/conferencista/') ? '/conferencista' : '';
    this.router.navigate([`${prefix}/gestionar-capacitaciones/editar`, id]);
  }

  iraVisualizarinscritos(id: number) {
    const prefix = this.router.url.includes('/conferencista/') ? '/conferencista' : '';
    this.router.navigate([`${prefix}/gestionar-capacitaciones/visualizar-inscritos`, id]);
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
      await firstValueFrom(this.capacitacionesService.updateCapacitacion(Id_Capacitacion, { estado: EstadoCapacitacionEnum.REALIZADA }));
      this.presentToast('Capacitación finalizada exitosamente', 'success');
      this.RecuperarCapacitaciones();
    } catch (error) {
      console.error('Error al finalizar la capacitación:', error);
      this.presentToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
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
    const alert = await this.alertController.create({
      header: 'Confirmar emisión de certificados',
      message: `Se emitirán certificados para todos los asistentes confirmados. Los usuarios que no marcaron asistencia no recibirán certificado. ¿Desea continuar?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Emitir certificados',
          handler: () => {
            this.iraGenerarCertificado(Id_Capacitacion);
          }
        }
      ]
    });
    await alert.present();
    this.cdr.markForCheck();
  }

  async iraGenerarCertificado(Id_Capacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Generando certificados y códigos QR... Por favor espere.',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // 1. Llamar al servicio de generación masiva (Backend real)
      await firstValueFrom(this.capacitacionesService.generateAllCertificates(Id_Capacitacion));

      // 2. Marcar la capacitación como que ya tiene certificados (Actualización de flag)
      await firstValueFrom(this.capacitacionesService.updateCapacitacion(Id_Capacitacion, { certificado: true }));

      this.presentToast('Certificados generados correctamente', 'success');
      this.RecuperarCapacitaciones();
    } catch (error) {
      console.error('Error al emitir el certificado:', error);
      this.presentToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
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
  volver() {
    this.router.navigate(['/home']);
  }

  verDetalles(cap: Capacitacion) {
    this.selectedCapacitacion = cap;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.selectedCapacitacion = null;
    this.cdr.markForCheck();
  }

  abrirMapa(lugar: string) {
    if (!lugar) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;
    window.open(url, '_blank');
  }
}
