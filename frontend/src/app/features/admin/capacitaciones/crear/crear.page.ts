import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ToastController, AlertController, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CapacitacionesService } from 'src/app/features/admin/capacitaciones/services/capacitaciones.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { EstadoCapacitacionEnum, RolCapacitacionEnum } from 'src/app/shared/constants/enums';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, schoolOutline, informationCircleOutline, 
  textOutline, optionsOutline, documentTextOutline, calendarOutline, 
  timeOutline, hourglassOutline, locationOutline, toggleOutline, 
  wifiOutline, peopleOutline, briefcaseOutline, personOutline, 
  personAddOutline, lockClosedOutline, ribbon, ribbonOutline, 
  checkmarkDoneOutline, trashOutline, checkmarkCircle, time, closeCircle,
  sparklesOutline, shieldCheckmarkOutline, arrowForwardOutline, checkmark,
  checkmarkOutline, closeOutline, constructOutline, laptopOutline,
  gitMergeOutline, linkOutline, openOutline, alertCircle, alertCircleOutline,
  businessOutline, locateOutline, mapOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearPage implements OnInit {
  @ViewChild('capacitacionForm') capacitacionForm!: NgForm;

  capacitacion = {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    lugar: '',
    estado: EstadoCapacitacionEnum.PENDIENTE,
    modalidad: 'PRESENCIAL',
    tipoEvento: 'CAPACITACIÓN',
    enlaceVirtual: '',
    horaInicio: '',
    horaFin: '',
    horas: 0,
    cuposDisponibles: 30,
    entidadesEncargadas: [] as number[],
    idsUsuarios: [] as number[],
    expositores: [] as number[],
    latitud: undefined as number | undefined,
    longitud: undefined as number | undefined
  };

  entidades: any[] = [];
  usuarios: any[] = [];
  usuariosDisponibles: any[] = [];

  cargandoDatos = true;
  guardando = false;
  fechaMinima: string = '';
  duracionHoras: number = 0;
  duracionMinutos: number = 0;

  // Wizard steps
  currentStep = 1;
  totalSteps = 4;

  private capacitacionesService = inject(CapacitacionesService);
  private catalogoService = inject(CatalogoService);
  private usuarioService = inject(UsuarioService);

  // Map Picker State
  isMapModalOpen = false;
  private pickerMap!: L.Map;
  private pickerMarker!: L.Marker;
  tempLat: number | null = null;
  tempLng: number | null = null;
  tempLugar: string = '';
  buscandoDireccion = false;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController,
    private cdr: ChangeDetectorRef
  ) { 
    addIcons({
      arrowBackOutline, schoolOutline, informationCircleOutline, 
      textOutline, optionsOutline, documentTextOutline, calendarOutline, 
      timeOutline, hourglassOutline, locationOutline, toggleOutline, 
      wifiOutline, peopleOutline, briefcaseOutline, personOutline, 
      personAddOutline, lockClosedOutline, ribbon, ribbonOutline, 
      checkmarkDoneOutline, trashOutline, checkmarkCircle, time, closeCircle,
      sparklesOutline, shieldCheckmarkOutline, arrowForwardOutline, checkmark,
      checkmarkOutline, closeOutline, constructOutline, laptopOutline,
      gitMergeOutline, linkOutline, openOutline, alertCircle, alertCircleOutline,
      businessOutline, locateOutline, mapOutline
    });
  }

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDatos();
  }

  inicializarFormulario() {
    // Establecer fecha mínima (hoy)
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.capacitacion.fechaInicio = this.fechaMinima;

    // Establecer horas por defecto
    const horaInicio = new Date();
    horaInicio.setHours(horaInicio.getHours() + 1, 0, 0, 0);
    this.capacitacion.horaInicio = horaInicio.toTimeString().substring(0, 5);

    const horaFin = new Date(horaInicio);
    horaFin.setHours(horaFin.getHours() + 2);
    this.capacitacion.horaFin = horaFin.toTimeString().substring(0, 5);

    this.capacitacion.horas = 2;
    this.duracionHoras = 2;
    this.duracionMinutos = 0;
  }

  actualizarHorasTotales() {
    this.capacitacion.horas = Number(this.duracionHoras || 0) + (Number(this.duracionMinutos || 0) / 60);
    // Redondear a 2 decimales si es necesario
    this.capacitacion.horas = Math.round(this.capacitacion.horas * 100) / 100;
  }

  async cargarDatos() {
    console.log('🔄 Iniciando carga de datos...');
    this.cargandoDatos = true;
    this.cdr.markForCheck();

    try {
      const [entidadesResult, usuariosResult] = await Promise.all([
        firstValueFrom(this.catalogoService.getItems('entidades')),
        firstValueFrom(this.usuarioService.getUsuarios())
      ]);

      // Entidades
      this.entidades = entidadesResult || [];
      const cnc = this.entidades.find(e =>
        e.nombre?.toLowerCase().includes('cnc') ||
        e.nombre?.toLowerCase().includes('consejo nacional')
      );
      if (cnc) {
        this.capacitacion.entidadesEncargadas = [cnc.id];
      }

      // Usuarios: Filtrar por Rol (Seguro)
      const todosLosUsuarios = usuariosResult || [];
      // Responsables: Solo Administradores y Conferencistas
      this.usuarios = todosLosUsuarios.filter(u => 
        u.rol?.codigo === 'ADMIN' || u.rol?.codigo === 'CONFERENCISTA'
      );
      // Participantes: Solo usuarios normales
      this.usuariosDisponibles = todosLosUsuarios.filter(u => 
        u.rol?.codigo === 'USUARIO'
      );

    } catch (error) {
      console.error('Error cargando datos requeridos:', error);
      this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    } finally {
      this.cargandoDatos = false;
      this.cdr.markForCheck();
      console.log('✅ Carga completa.');
    }
  }

  onModalidadChange() {
    if (this.capacitacion.modalidad === 'PRESENCIAL') {
      this.capacitacion.enlaceVirtual = '';
    } else if (this.capacitacion.modalidad === 'VIRTUAL') {
      this.capacitacion.lugar = '';
      this.capacitacion.latitud = undefined;
      this.capacitacion.longitud = undefined;
    }
  }

  validarHorarios(): boolean {
    if (!this.capacitacion.horaInicio || !this.capacitacion.horaFin) {
      return true; // No validar si están vacíos
    }

    const [horaI, minI] = this.capacitacion.horaInicio.split(':').map(Number);
    const [horaF, minF] = this.capacitacion.horaFin.split(':').map(Number);

    const minutosInicio = horaI * 60 + minI;
    const minutosFin = horaF * 60 + minF;

    return minutosFin > minutosInicio;
  }

  calcularProgreso(): number {
    let completados = 0;
    let total = 10;

    if (this.capacitacion.nombre) completados++;
    if (this.capacitacion.descripcion) completados++;
    if (this.capacitacion.fechaInicio) completados++;
    if (this.capacitacion.horaInicio) completados++;
    if (this.capacitacion.horaFin) completados++;
    if (this.capacitacion.horas > 0) completados++;
    if (this.capacitacion.lugar) completados++;
    if (this.capacitacion.cuposDisponibles > 0) completados++;
    if (this.capacitacion.expositores?.length > 0) completados++;
    if (this.capacitacion.entidadesEncargadas?.length > 0) completados++;

    // Agregar enlace virtual si es necesario
    if (this.capacitacion.modalidad === 'VIRTUAL') {
      total = 11;
      if (this.capacitacion.enlaceVirtual) completados++;
    }

    return Math.round((completados / total) * 100);
  }

  async guardarCapacitacion() {
    // Validación de formulario
    if (!this.capacitacionForm.valid) {
      this.mostrarToast('Complete todos los campos obligatorios', 'warning');
      this.marcarCamposComoTocados();
      return;
    }

    // Validación de horarios
    if (!this.validarHorarios()) {
      this.mostrarToast('La hora de fin debe ser posterior a la hora de inicio', 'warning');
      return;
    }

    // Validación de enlace virtual
    if (this.capacitacion.modalidad === 'VIRTUAL' && !this.capacitacion.enlaceVirtual) {
      this.mostrarToast('El enlace virtual es obligatorio para modalidad virtual', 'warning');
      return;
    }

    // Validación de expositores
    if (!this.capacitacion.expositores || this.capacitacion.expositores.length === 0) {
      this.mostrarToast('Debe seleccionar al menos un responsable/expositor', 'warning');
      return;
    }

    // Validación de entidades
    if (!this.capacitacion.entidadesEncargadas || this.capacitacion.entidadesEncargadas.length === 0) {
      this.mostrarToast('Debe seleccionar al menos una entidad organizadora', 'warning');
      return;
    }

    this.guardando = true;

    // Formatear enlace virtual
    if (this.capacitacion.enlaceVirtual &&
      !this.capacitacion.enlaceVirtual.startsWith('http://') &&
      !this.capacitacion.enlaceVirtual.startsWith('https://')) {
      this.capacitacion.enlaceVirtual = 'https://' + this.capacitacion.enlaceVirtual;
    }

    // Crear capacitación (Ahora con participantes y expositores incluidos)
    try {
      const response: any = await firstValueFrom(this.capacitacionesService.createCapacitacion(this.capacitacion));
      const created = Array.isArray(response) ? response[0] : (response.data || response);
      const capacitacionId = created?.id || created?.Id_Capacitacion;

      if (!capacitacionId) {
        this.guardando = false;
        this.mostrarToast('Error: No se recibió confirmación del servidor (ID faltante)', 'danger');
        this.cdr.markForCheck();
        return;
      }

      this.guardando = false;
      this.mostrarExito();
    } catch (error: any) {
      this.guardando = false;
      console.error('Error al crear capacitación:', error);
      this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    } finally {
      this.cdr.markForCheck();
    }
  }

  async mostrarExito() {
    const alert = await this.alertController.create({
      header: '¡Éxito!',
      message: 'La capacitación se ha creado correctamente.',
      buttons: [
        {
          text: 'Ver lista',
          handler: () => {
            this.navController.navigateBack('/gestionar-capacitaciones');
          }
        },
        {
          text: 'Crear otra',
          handler: () => {
            this.reiniciarFormulario();
          }
        }
      ]
    });

    await alert.present();
  }

  async cancelar() {
    if (this.hayDatosIngresados()) {
      const alert = await this.alertController.create({
        header: 'Cancelar creación',
        message: '¿Está seguro? Se perderán todos los datos ingresados.',
        buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Sí, cancelar',
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

  reiniciarFormulario() {
    const entidadesSeleccionadas = [...this.capacitacion.entidadesEncargadas];

    this.capacitacion = {
      nombre: '',
      descripcion: '',
      fechaInicio: this.fechaMinima,
      lugar: '',
      estado: EstadoCapacitacionEnum.PENDIENTE,
      modalidad: 'PRESENCIAL',
      tipoEvento: 'CAPACITACIÓN',
      enlaceVirtual: '',
      horaInicio: '',
      horaFin: '',
      horas: 0,
      cuposDisponibles: 30,
      entidadesEncargadas: entidadesSeleccionadas,
      idsUsuarios: [],
      expositores: [],
      latitud: undefined,
      longitud: undefined
    };

    this.duracionHoras = 2;
    this.duracionMinutos = 0;
    this.inicializarFormulario();

    if (this.capacitacionForm) {
      this.capacitacionForm.resetForm(this.capacitacion);
    }
  }

  hayDatosIngresados(): boolean {
    return !!(
      this.capacitacion.nombre ||
      this.capacitacion.descripcion ||
      this.capacitacion.lugar ||
      this.capacitacion.enlaceVirtual ||
      this.capacitacion.horas > 0 ||
      this.capacitacion.expositores?.length > 0 ||
      this.capacitacion.idsUsuarios?.length > 0 ||
      this.capacitacion.latitud
    );
  }

  // --- MAP PICKER LOGIC ---
  abrirSelectorMapa() {
    this.isMapModalOpen = true;
    this.cdr.markForCheck();
  }

  initPickerMap() {
    setTimeout(() => {
      const defaultLat = this.capacitacion.latitud || -0.1807; // Quito
      const defaultLng = this.capacitacion.longitud || -78.4678;

      // Importante: Eliminar instancia previa si existe porque el DOM es recreado por ion-modal
      if (this.pickerMap) {
        this.pickerMap.remove();
        (this as any).pickerMap = null;
      }
      if (this.pickerMarker) {
        this.pickerMarker.remove();
        (this as any).pickerMarker = null;
      }

      this.pickerMap = L.map('mapPicker').setView([defaultLat, defaultLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.pickerMap);

      this.pickerMap.on('click', (e: L.LeafletMouseEvent) => {
        this.setPickerMarker(e.latlng.lat, e.latlng.lng);
      });

      // Si ya hay coordenadas, poner el marcador
      if (this.capacitacion.latitud && this.capacitacion.longitud) {
        this.setPickerMarker(this.capacitacion.latitud, this.capacitacion.longitud);
      }
      
      this.pickerMap.invalidateSize();
    }, 300); // Un poco más de tiempo para que el modal esté fijo
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

    // Reverse Geocoding
    this.buscandoDireccion = true;
    this.cdr.markForCheck();
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await resp.json();
      this.tempLugar = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (e) {
      this.tempLugar = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } finally {
      this.buscandoDireccion = false;
      this.cdr.markForCheck();
    }
  }

  confirmarUbicacion() {
    if (this.tempLat && this.tempLng) {
      this.capacitacion.latitud = this.tempLat;
      this.capacitacion.longitud = this.tempLng;
      this.capacitacion.lugar = this.tempLugar;
      this.isMapModalOpen = false;
      this.mostrarToast('Ubicación establecida', 'success');
      this.cdr.markForCheck();
    }
  }

  marcarCamposComoTocados() {
    Object.keys(this.capacitacionForm.controls).forEach(key => {
      this.capacitacionForm.controls[key].markAsTouched();
    });
  }

  abrirEnlace(enlace: string) {
    if (!enlace) return;

    const url = enlace.startsWith('http') ? enlace : 'https://' + enlace;
    window.open(url, '_blank');
  }

  abrirMapa() {
    if (this.capacitacion.latitud && this.capacitacion.longitud) {
      const url = `https://www.google.com/maps/search/?api=1&query=${this.capacitacion.latitud},${this.capacitacion.longitud}`;
      window.open(url, '_blank');
      return;
    }
    
    if (!this.capacitacion.lugar) {
      this.mostrarToast('Por favor, seleccione una ubicación en el mapa o ingrese un lugar', 'warning');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.capacitacion.lugar)}`;
    window.open(url, '_blank');
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

  // Wizard Navigation Methods
  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1: // Información Básica
        if (!this.capacitacion.nombre || !this.capacitacion.descripcion) {
          this.mostrarToast('Complete el nombre y descripción', 'warning');
          return false;
        }
        return true;

      case 2: // Fecha y Horario
        if (!this.capacitacion.fechaInicio || !this.capacitacion.horaInicio ||
          !this.capacitacion.horaFin || !this.capacitacion.horas) {
          this.mostrarToast('Complete todos los campos de fecha y horario', 'warning');
          return false;
        }
        if (!this.validarHorarios()) {
          this.mostrarToast('La hora de fin debe ser posterior a la hora de inicio', 'warning');
          return false;
        }
        return true;

      case 3: // Modalidad y Ubicación
        if (this.capacitacion.modalidad !== 'VIRTUAL' && !this.capacitacion.lugar) {
          this.mostrarToast('Complete el lugar de la sede física', 'warning');
          return false;
        }
        if (!this.capacitacion.cuposDisponibles) {
          this.mostrarToast('Complete el límite de participantes', 'warning');
          return false;
        }
        if (this.capacitacion.modalidad === 'VIRTUAL' && !this.capacitacion.enlaceVirtual) {
          this.mostrarToast('El enlace virtual es obligatorio para modalidad virtual', 'warning');
          return false;
        }
        return true;

      case 4: // Responsables
        if (!this.capacitacion.expositores || this.capacitacion.expositores.length === 0) {
          this.mostrarToast('Debe seleccionar al menos un responsable', 'warning');
          return false;
        }
        if (!this.capacitacion.entidadesEncargadas || this.capacitacion.entidadesEncargadas.length === 0) {
          this.mostrarToast('Debe seleccionar al menos una entidad', 'warning');
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  getStepTitle(step: number): string {
    const titles = [
      'Información Básica',
      'Fecha y Horario',
      'Modalidad y Ubicación',
      'Responsables y Participantes'
    ];
    return titles[step - 1] || '';
  }
}

