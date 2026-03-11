import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import * as L from 'leaflet';
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
  sparklesOutline, shieldCheckmarkOutline, locateOutline, mapOutline
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
    certificado: false,
    latitud: undefined as number | undefined,
    longitud: undefined as number | undefined
  };

  capacitacionOriginal: any = {};
  entidadesList: any[] = [];
  expositoresList: any[] = [];
  participantesList: any[] = [];

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
      sparklesOutline, shieldCheckmarkOutline, locateOutline, mapOutline
    });
  }

  // Map Picker State
  isMapModalOpen = false;
  private pickerMap!: L.Map;
  private pickerMarker!: L.Marker;
  tempLat: number | null = null;
  tempLng: number | null = null;
  tempLugar: string = '';
  buscandoDireccion = false;

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
    const todos = data || [];
    
    // Responsables: Solo ADMIN y CONFERENCISTA
    this.expositoresList = todos.filter(u => 
      u.rol?.codigo === 'ADMIN' || u.rol?.codigo === 'CONFERENCISTA'
    );
    
    // Participantes: Solo USUARIO
    this.participantesList = todos.filter(u => 
      u.rol?.codigo === 'USUARIO'
    );
  }

  onModalidadChange() {
    if (this.capacitacion.modalidad === 'PRESENCIAL') {
      this.capacitacion.enlaceVirtual = '';
    } else if (this.capacitacion.modalidad === 'VIRTUAL') {
      this.capacitacion.lugar = '';
      this.capacitacion.latitud = undefined;
      this.capacitacion.longitud = undefined;
    }
    this.cd.markForCheck();
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
        entidadesEncargadas: this.capacitacion.entidadesEncargadas || [],
        latitud: this.capacitacion.latitud,
        longitud: this.capacitacion.longitud
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

  // --- MAP PICKER LOGIC ---
  abrirSelectorMapa() {
    this.isMapModalOpen = true;
    this.cd.markForCheck();
  }

  initPickerMap() {
    setTimeout(() => {
      const defaultLat = this.capacitacion.latitud || -0.1807;
      const defaultLng = this.capacitacion.longitud || -78.4678;

      if (this.pickerMap) {
        this.pickerMap.remove();
        (this as any).pickerMap = null;
      }
      if (this.pickerMarker) {
        this.pickerMarker.remove();
        (this as any).pickerMarker = null;
      }

      this.pickerMap = L.map('mapPickerEdit').setView([defaultLat, defaultLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.pickerMap);

      this.pickerMap.on('click', (e: L.LeafletMouseEvent) => {
        this.setPickerMarker(e.latlng.lat, e.latlng.lng);
      });

      if (this.capacitacion.latitud && this.capacitacion.longitud) {
        this.setPickerMarker(this.capacitacion.latitud, this.capacitacion.longitud);
      }
      
      this.pickerMap.invalidateSize();
    }, 300);
  }

  async setPickerMarker(lat: number, lng: number) {
    this.tempLat = lat;
    this.tempLng = lng;

    if (!this.pickerMarker) {
      this.pickerMarker = L.marker([lat, lng], { draggable: true }).addTo(this.pickerMap);
      this.pickerMarker.on('dragend', () => {
        const pos = this.pickerMarker.getLatLng();
        this.setPickerMarker(pos.lat, pos.lng);
      });
    } else {
      this.pickerMarker.setLatLng([lat, lng]);
    }

    this.buscandoDireccion = true;
    this.cd.markForCheck();
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await resp.json();
      this.tempLugar = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (e) {
      this.tempLugar = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } finally {
      this.buscandoDireccion = false;
      this.cd.markForCheck();
    }
  }

  confirmarUbicacion() {
    if (this.tempLat && this.tempLng) {
      this.capacitacion.latitud = this.tempLat;
      this.capacitacion.longitud = this.tempLng;
      this.capacitacion.lugar = this.tempLugar;
      this.isMapModalOpen = false;
      this.mostrarToast('Ubicación establecida', 'success');
      this.cd.markForCheck();
    }
  }

  abrirMapa() {
    if (this.capacitacion.latitud && this.capacitacion.longitud) {
      const url = `https://www.google.com/maps/search/?api=1&query=${this.capacitacion.latitud},${this.capacitacion.longitud}`;
      window.open(url, '_blank');
      return;
    }

    if (!this.capacitacion.lugar) {
      this.mostrarToast('Por favor, ingrese un lugar o use el mapa', 'warning');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.capacitacion.lugar)}`;
    window.open(url, '_blank');
  }
}
