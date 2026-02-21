import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ToastController, AlertController, NavController } from '@ionic/angular';
import { CapacitacionesService } from 'src/app/features/admin/capacitaciones/services/capacitaciones.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearPage implements OnInit {
  @ViewChild('capacitacionForm') capacitacionForm!: NgForm;

  capacitacion = {
    Nombre_Capacitacion: '',
    Descripcion_Capacitacion: '',
    Fecha_Capacitacion: '',
    Lugar_Capacitacion: '',
    Estado: 0,
    Modalidades: 'Presencial',
    Enlace_Virtual: '',
    Hora_Inicio: '',
    Hora_Fin: '',
    Horas: 0,
    Limite_Participantes: 30,
    entidades_encargadas: [] as number[],
    ids_usuarios: [] as number[],
    expositores: [] as number[]
  };

  entidades: any[] = [];
  usuarios: any[] = [];
  usuariosDisponibles: any[] = [];

  cargandoDatos = true;
  guardando = false;
  fechaMinima: string = '';

  // Wizard steps
  currentStep = 1;
  totalSteps = 4;

  private capacitacionesService = inject(CapacitacionesService);
  private catalogoService = inject(CatalogoService);
  private usuarioService = inject(UsuarioService);

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDatos();
  }

  inicializarFormulario() {
    // Establecer fecha mínima (hoy)
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.capacitacion.Fecha_Capacitacion = this.fechaMinima;

    // Establecer horas por defecto
    const horaInicio = new Date();
    horaInicio.setHours(horaInicio.getHours() + 1, 0, 0, 0);
    this.capacitacion.Hora_Inicio = horaInicio.toTimeString().substring(0, 5);

    const horaFin = new Date(horaInicio);
    horaFin.setHours(horaFin.getHours() + 2);
    this.capacitacion.Hora_Fin = horaFin.toTimeString().substring(0, 5);

    this.capacitacion.Horas = 2;
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
        e.Nombre_Entidad?.toLowerCase().includes('cnc') ||
        e.Nombre_Entidad?.toLowerCase().includes('consejo nacional')
      );
      if (cnc) {
        this.capacitacion.entidades_encargadas = [cnc.Id_Entidad];
      }

      // Usuarios
      this.usuarios = usuariosResult || [];
      this.usuariosDisponibles = [...this.usuarios];

    } catch (error) {
      console.error('Error cargando datos requeridos:', error);
      this.mostrarToast('Error al cargar la información base de catálogos y usuarios', 'danger');
    } finally {
      this.cargandoDatos = false;
      this.cdr.markForCheck();
      console.log('✅ Carga completa.');
    }
  }

  onModalidadChange() {
    // Limpiar enlace virtual si no es necesario
    if (this.capacitacion.Modalidades === 'Presencial') {
      this.capacitacion.Enlace_Virtual = '';
    }
  }

  validarHorarios(): boolean {
    if (!this.capacitacion.Hora_Inicio || !this.capacitacion.Hora_Fin) {
      return true; // No validar si están vacíos
    }

    const [horaI, minI] = this.capacitacion.Hora_Inicio.split(':').map(Number);
    const [horaF, minF] = this.capacitacion.Hora_Fin.split(':').map(Number);

    const minutosInicio = horaI * 60 + minI;
    const minutosFin = horaF * 60 + minF;

    return minutosFin > minutosInicio;
  }

  calcularProgreso(): number {
    let completados = 0;
    let total = 10;

    if (this.capacitacion.Nombre_Capacitacion) completados++;
    if (this.capacitacion.Descripcion_Capacitacion) completados++;
    if (this.capacitacion.Fecha_Capacitacion) completados++;
    if (this.capacitacion.Hora_Inicio) completados++;
    if (this.capacitacion.Hora_Fin) completados++;
    if (this.capacitacion.Horas > 0) completados++;
    if (this.capacitacion.Lugar_Capacitacion) completados++;
    if (this.capacitacion.Limite_Participantes > 0) completados++;
    if (this.capacitacion.expositores?.length > 0) completados++;
    if (this.capacitacion.entidades_encargadas?.length > 0) completados++;

    // Agregar enlace virtual si es necesario
    if (this.capacitacion.Modalidades === 'Virtual') {
      total = 11;
      if (this.capacitacion.Enlace_Virtual) completados++;
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
    if (this.capacitacion.Modalidades === 'Virtual' && !this.capacitacion.Enlace_Virtual) {
      this.mostrarToast('El enlace virtual es obligatorio para modalidad virtual', 'warning');
      return;
    }

    // Validación de expositores
    if (!this.capacitacion.expositores || this.capacitacion.expositores.length === 0) {
      this.mostrarToast('Debe seleccionar al menos un responsable/expositor', 'warning');
      return;
    }

    // Validación de entidades
    if (!this.capacitacion.entidades_encargadas || this.capacitacion.entidades_encargadas.length === 0) {
      this.mostrarToast('Debe seleccionar al menos una entidad organizadora', 'warning');
      return;
    }

    this.guardando = true;

    // Formatear enlace virtual
    if (this.capacitacion.Enlace_Virtual &&
      !this.capacitacion.Enlace_Virtual.startsWith('http://') &&
      !this.capacitacion.Enlace_Virtual.startsWith('https://')) {
      this.capacitacion.Enlace_Virtual = 'https://' + this.capacitacion.Enlace_Virtual;
    }

    // Crear capacitación
    try {
      const response: any = await firstValueFrom(this.capacitacionesService.createCapacitacion(this.capacitacion));
      const created = Array.isArray(response) ? response[0] : (response.data || response);
      const capacitacionId = created?.Id_Capacitacion;

      if (!capacitacionId) {
        this.guardando = false;
        this.mostrarToast('Error: No se recibió confirmación del servidor', 'danger');
        this.cdr.markForCheck();
        return;
      }

      // Asignar expositores
      await this.asignarUsuarios(capacitacionId, this.capacitacion.expositores, 'Expositor');

      // Asignar participantes
      if (this.capacitacion.ids_usuarios?.length > 0) {
        const participantes = this.capacitacion.ids_usuarios.filter(
          id => !this.capacitacion.expositores.includes(id)
        );
        await this.asignarUsuarios(capacitacionId, participantes, 'Participante');
      }

      this.guardando = false;
      this.mostrarExito();
    } catch (error: any) {
      this.guardando = false;
      console.error('Error al crear capacitación:', error);
      const mensaje = error.error?.message || error.message || 'Error desconocido';
      this.mostrarToast(`Error al crear la capacitación: ${mensaje}`, 'danger');
    } finally {
      this.cdr.markForCheck();
    }
  }

  async asignarUsuarios(capacitacionId: number, usuarioIds: number[], rol: string): Promise<void> {
    const promesas = usuarioIds.map(async (usuarioId) => {
      try {
        await firstValueFrom(this.capacitacionesService.assignUser(capacitacionId, usuarioId, rol));
      } catch (err) {
        console.error(`Error asignando ${rol}:`, err);
      }
    });

    await Promise.all(promesas);
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
    const entidadesSeleccionadas = [...this.capacitacion.entidades_encargadas];

    this.capacitacion = {
      Nombre_Capacitacion: '',
      Descripcion_Capacitacion: '',
      Fecha_Capacitacion: this.fechaMinima,
      Lugar_Capacitacion: '',
      Estado: 0,
      Modalidades: 'Presencial',
      Enlace_Virtual: '',
      Hora_Inicio: '',
      Hora_Fin: '',
      Horas: 0,
      Limite_Participantes: 30,
      entidades_encargadas: entidadesSeleccionadas,
      ids_usuarios: [],
      expositores: []
    };

    this.inicializarFormulario();

    if (this.capacitacionForm) {
      this.capacitacionForm.resetForm(this.capacitacion);
    }
  }

  hayDatosIngresados(): boolean {
    return !!(
      this.capacitacion.Nombre_Capacitacion ||
      this.capacitacion.Descripcion_Capacitacion ||
      this.capacitacion.Lugar_Capacitacion ||
      this.capacitacion.Enlace_Virtual ||
      this.capacitacion.Horas > 0 ||
      this.capacitacion.expositores?.length > 0 ||
      this.capacitacion.ids_usuarios?.length > 0
    );
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
        if (!this.capacitacion.Nombre_Capacitacion || !this.capacitacion.Descripcion_Capacitacion) {
          this.mostrarToast('Complete el nombre y descripción', 'warning');
          return false;
        }
        return true;

      case 2: // Fecha y Horario
        if (!this.capacitacion.Fecha_Capacitacion || !this.capacitacion.Hora_Inicio ||
          !this.capacitacion.Hora_Fin || !this.capacitacion.Horas) {
          this.mostrarToast('Complete todos los campos de fecha y horario', 'warning');
          return false;
        }
        if (!this.validarHorarios()) {
          this.mostrarToast('La hora de fin debe ser posterior a la hora de inicio', 'warning');
          return false;
        }
        return true;

      case 3: // Modalidad y Ubicación
        if (!this.capacitacion.Lugar_Capacitacion || !this.capacitacion.Limite_Participantes) {
          this.mostrarToast('Complete el lugar y límite de participantes', 'warning');
          return false;
        }
        if (this.capacitacion.Modalidades === 'Virtual' && !this.capacitacion.Enlace_Virtual) {
          this.mostrarToast('El enlace virtual es obligatorio para modalidad virtual', 'warning');
          return false;
        }
        return true;

      case 4: // Responsables
        if (!this.capacitacion.expositores || this.capacitacion.expositores.length === 0) {
          this.mostrarToast('Debe seleccionar al menos un responsable', 'warning');
          return false;
        }
        if (!this.capacitacion.entidades_encargadas || this.capacitacion.entidades_encargadas.length === 0) {
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

