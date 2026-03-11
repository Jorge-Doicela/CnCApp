import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { CapacitacionesService } from 'src/app/features/admin/capacitaciones/services/capacitaciones.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { EstadoCapacitacionEnum } from 'src/app/shared/constants/enums';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, schoolOutline, informationCircleOutline, 
  textOutline, optionsOutline, documentTextOutline, calendarOutline, 
  timeOutline, hourglassOutline, locationOutline, toggleOutline, 
  wifiOutline, peopleOutline, briefcaseOutline, personOutline, 
  personAddOutline, lockClosedOutline, ribbon, ribbonOutline, 
  checkmarkDoneOutline, trashOutline, checkmarkCircle, time, closeCircle,
  sparklesOutline, shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarPage implements OnInit {
  @ViewChild('capacitacionForm') capacitacionForm!: NgForm;

  cargando: boolean = true;
  capacitacion = {
    id: null as number | null,
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    lugar: '',
    estado: EstadoCapacitacionEnum.PENDIENTE,
    plantillaId: null as number | null,
    modalidad: '',
    tipoEvento: '',
    enlaceVirtual: '',
    horaInicio: '',
    horaFin: '',
    horas: 0,
    cuposDisponibles: 0,
    entidadesEncargadas: [] as number[],
    idsUsuarios: [] as number[],
    expositores: [] as number[],
    certificado: false
  };

  capacitacionOriginal: any = {};
  entidadesList: any[] = [];
  usuariosList: any[] = [];

  private capacitacionesService = inject(CapacitacionesService);
  private catalogoService = inject(CatalogoService);
  private usuarioService = inject(UsuarioService);

  readonly EstadoCapacitacion = EstadoCapacitacionEnum;

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController,
    private loadingController: LoadingController,
    private cd: ChangeDetectorRef
  ) { 
    addIcons({
      arrowBackOutline, schoolOutline, informationCircleOutline, 
      textOutline, optionsOutline, documentTextOutline, calendarOutline, 
      timeOutline, hourglassOutline, locationOutline, toggleOutline, 
      wifiOutline, peopleOutline, briefcaseOutline, personOutline, 
      personAddOutline, lockClosedOutline, ribbon, ribbonOutline, 
      checkmarkDoneOutline, trashOutline, checkmarkCircle, time, closeCircle,
      sparklesOutline, shieldCheckmarkOutline
    });
  }

  ngOnInit() {
    const idCapacitacion = this.activatedRoute.snapshot.paramMap.get('id');
    if (idCapacitacion) {
      this.capacitacion.id = +idCapacitacion;
      // Non-blocking call
      this.cargarDatos();
    } else {
      this.mostrarToast('ID de capacitación no válido', 'danger');
      this.navController.navigateBack('/gestionar-capacitaciones');
    }
  }

  async cargarDatos() {
    this.cargando = true;
    this.cd.markForCheck();

    try {
      // Parallel fetch without full-screen block
      await Promise.all([
        this.cargarCapacitacion(),
        this.cargarEntidades(),
        this.cargarUsuarios()
      ]);

      if (!this.capacitacion.idsUsuarios) this.capacitacion.idsUsuarios = [];
      if (!this.capacitacion.entidadesEncargadas) this.capacitacion.entidadesEncargadas = [];
      if (!this.capacitacion.expositores) this.capacitacion.expositores = [];

      this.capacitacionOriginal = JSON.parse(JSON.stringify(this.capacitacion));
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      if (error?.status === 404 || error === 'No ID') {
        this.mostrarToast('No se encontró la capacitación solicitada', 'warning');
      } else {
        this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
      }
      setTimeout(() => {
        this.navController.navigateBack('/gestionar-capacitaciones');
      }, 2000);
    } finally {
      this.cargando = false;
      this.cd.detectChanges();
    }
  }

  async cargarCapacitacion() {
    if (!this.capacitacion.id) {
      throw new Error('No ID');
    }
    const data = await firstValueFrom(this.capacitacionesService.getCapacitacion(this.capacitacion.id));
    if (!data) {
      this.mostrarToast('No se encontró la capacitación', 'warning');
      this.navController.navigateBack('/gestionar-capacitaciones');
      throw new Error('No data');
    }
    
    // --- Normalización de Datos para Consistencia UI/UX ---
    const normalizedData = { ...data } as any;

    // 1. Normalizar Estados (Seed vs Enum)
    if (normalizedData.estado === 'Programada' || normalizedData.estado === 'Activa') {
      normalizedData.estado = EstadoCapacitacionEnum.PENDIENTE; // 'Activa'
    } else if (normalizedData.estado === 'Finalizada' || normalizedData.estado === 'REALIZADA') {
      normalizedData.estado = EstadoCapacitacionEnum.REALIZADA; // 'Finalizada'
    }

    // 2. Normalizar Modalidades
    if (normalizedData.modalidad === 'Híbrida' || normalizedData.modalidad === 'Semipresencial') {
      normalizedData.modalidad = 'PRESENCIAL Y VIRTUAL';
    } else {
      normalizedData.modalidad = normalizedData.modalidad?.toUpperCase() || 'PRESENCIAL';
    }

    // 3. Normalizar Tipo de Evento
    if (!normalizedData.tipoEvento) {
      normalizedData.tipoEvento = 'CAPACITACIÓN';
    } else {
      normalizedData.tipoEvento = normalizedData.tipoEvento.toUpperCase();
    }

    this.capacitacion = normalizedData;
  }

  async cargarEntidades() {
    const data = await firstValueFrom(this.catalogoService.getItems('entidades'));
    this.entidadesList = data || [];
  }

  async cargarUsuarios() {
    const data = await firstValueFrom(this.usuarioService.getUsuarios());
    this.usuariosList = data || [];
  }

  async actualizarCapacitacion() {
    if (!this.capacitacionForm.valid) {
      this.mostrarToast('Por favor complete todos los campos obligatorios', 'warning');
      return;
    }

    if (this.capacitacion.certificado && this.hayBioCambiosCriticos()) {
      const alert = await this.alertController.create({
        header: 'Advertencia',
        message: 'Esta capacitación tiene certificados emitidos. Cambiar información básica puede afectar la validez de los certificados. ¿Desea continuar?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Continuar',
            handler: () => {
              this.guardarCambios();
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.guardarCambios();
    }
  }

  hayBioCambiosCriticos(): boolean {
    return (
      this.capacitacion.nombre !== this.capacitacionOriginal.nombre ||
      this.capacitacion.fechaInicio !== this.capacitacionOriginal.fechaInicio ||
      this.capacitacion.lugar !== this.capacitacionOriginal.lugar ||
      this.capacitacion.horas !== this.capacitacionOriginal.horas
    );
  }

  async guardarCambios() {
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    if (!this.capacitacion.id) {
      loading.dismiss();
      return;
    }

    try {
      // --- LIMPIEZA PROFUNDA DEL PAYLOAD ---
      // Solo enviamos los campos que el backend espera para evitar errores de validación
      const cleanPayload = {
        nombre: this.capacitacion.nombre,
        descripcion: this.capacitacion.descripcion || null,
        tipoEvento: this.capacitacion.tipoEvento || 'CAPACITACIÓN',
        fechaInicio: this.capacitacion.fechaInicio || null,
        lugar: this.capacitacion.lugar || null,
        cuposDisponibles: Number(this.capacitacion.cuposDisponibles || 0),
        modalidad: this.capacitacion.modalidad || 'PRESENCIAL',
        estado: this.capacitacion.estado,
        plantillaId: this.capacitacion.plantillaId || null,
        horaInicio: this.capacitacion.horaInicio || null,
        horaFin: this.capacitacion.horaFin || null,
        horas: (this.capacitacion.horas !== null) ? Number(this.capacitacion.horas) : null,
        enlaceVirtual: this.capacitacion.enlaceVirtual || '',
        certificado: !!this.capacitacion.certificado,
        idsUsuarios: this.capacitacion.idsUsuarios || [],
        expositores: this.capacitacion.expositores || [],
        entidadesEncargadas: this.capacitacion.entidadesEncargadas || []
      };

      // Sanitización final de URL
      if (cleanPayload.enlaceVirtual && !cleanPayload.enlaceVirtual.startsWith('http')) {
        cleanPayload.enlaceVirtual = 'https://' + cleanPayload.enlaceVirtual;
      }

      await firstValueFrom(this.capacitacionesService.updateCapacitacion(this.capacitacion.id!, cleanPayload as any));
      this.capacitacionOriginal = JSON.parse(JSON.stringify(this.capacitacion));
      this.mostrarToast('Capacitación actualizada correctamente', 'success');

      if (this.capacitacion.estado === EstadoCapacitacionEnum.REALIZADA && !this.capacitacion.certificado) {
        this.preguntarEmitirCertificados();
      } else {
        setTimeout(() => {
          this.navController.navigateBack('/gestionar-capacitaciones');
        }, 1000);
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    } finally {
      loading.dismiss();
      this.cd.markForCheck();
    }
  }

  async cancelarEdicion() {
    if (JSON.stringify(this.capacitacion) !== JSON.stringify(this.capacitacionOriginal)) {
      const alert = await this.alertController.create({
        header: 'Cambios no guardados',
        message: '¿Está seguro que desea cancelar? Los cambios realizados no se guardarán.',
        buttons: [
          {
            text: 'Continuar editando',
            role: 'cancel'
          },
          {
            text: 'Descartar cambios',
            handler: () => {
              this.navController.navigateBack('/gestionar-capacitaciones');
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.navController.navigateBack('/gestionar-capacitaciones');
    }
  }

  async finalizarCapacitacion() {
    const alert = await this.alertController.create({
      header: 'Finalizar capacitación',
      message: '¿Está seguro que desea marcar esta capacitación como realizada? Esto permitirá emitir certificados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Finalizar',
          handler: async () => {
            this.capacitacion.estado = EstadoCapacitacionEnum.REALIZADA;
            await this.guardarCambios();
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro de eliminar esta capacitación? Esta acción no se puede deshacer y se perderán todos los datos asociados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarCapacitacion();
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarCapacitacion() {
    const loading = await this.loadingController.create({
      message: 'Eliminando capacitación...',
      spinner: 'crescent'
    });
    await loading.present();

    if (!this.capacitacion.id) {
      loading.dismiss();
      return;
    }

    try {
      await firstValueFrom(this.capacitacionesService.deleteCapacitacion(this.capacitacion.id));
      this.mostrarToast('Capacitación eliminada correctamente', 'success');
      setTimeout(() => {
        this.navController.navigateBack('/gestionar-capacitaciones');
      }, 1500);
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.mostrarToast('Error al eliminar capacitación', 'danger');
    } finally {
      loading.dismiss();
      this.cd.markForCheck();
    }
  }

  async preguntarEmitirCertificados() {
    const alert = await this.alertController.create({
      header: 'Emitir Certificados',
      message: 'Ha marcado esta capacitación como "Realizada". ¿Desea emitir los certificados ahora?',
      buttons: [
        {
          text: 'Más tarde',
          handler: () => {
            this.navController.navigateBack('/gestionar-capacitaciones');
          }
        },
        {
          text: 'Emitir ahora',
          handler: () => {
            this.irAEmitirCertificados();
          }
        }
      ]
    });
    await alert.present();
  }

  irAEmitirCertificados() {
    this.navController.navigateForward(`/gestionar-capacitaciones/visualizar-inscritos/${this.capacitacion.id}`);
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
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
