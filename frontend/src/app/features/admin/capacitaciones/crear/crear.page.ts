import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { CapacitacionesService } from 'src/app/features/admin/capacitaciones/services/capacitaciones.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CrearPage implements OnInit {
  @ViewChild('capacitacionForm') capacitacionForm!: NgForm;

  capacitacion = {
    Nombre_Capacitacion: '',
    Descripcion_Capacitacion: '',
    Fecha_Capacitacion: '',
    Lugar_Capacitacion: '',
    Estado: 0,
    Modalidades: 'Virtual',
    Enlace_Virtual: '',
    Hora_Inicio: '',
    Hora_Fin: '',
    Horas: 0,
    Limite_Participantes: 0,
    entidades_encargadas: [] as number[],
    ids_usuarios: [] as number[],
    expositores: [] as number[]
  };

  entidades: any[] = [];
  usuarios: any[] = [];
  usuariosDisponibles: any[] = []; // Lista filtrada para participantes (sin expositores)

  private capacitacionesService = inject(CapacitacionesService);
  private catalogoService = inject(CatalogoService);
  private usuarioService = inject(UsuarioService);

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.cargarEntidadesYUsuarios();

    // Establecer horas por defecto
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0); // Próxima hora en punto

    const horaInicio = now.toTimeString().substr(0, 5);
    now.setHours(now.getHours() + 1);
    const horaFin = now.toTimeString().substr(0, 5);

    this.capacitacion.Hora_Inicio = horaInicio;
    this.capacitacion.Hora_Fin = horaFin;

    // Establecer fecha por defecto (hoy)
    this.capacitacion.Fecha_Capacitacion = new Date().toISOString().split('T')[0];
  }

  // Función para detectar cambios en la selección de modalidad
  onModalidadChange() {
    // Si cambia de modalidad y no es virtual o híbrida, limpiamos el enlace
    if (this.capacitacion.Modalidades !== 'Virtual' && this.capacitacion.Modalidades !== 'Hibrida') {
      this.capacitacion.Enlace_Virtual = '';
    }
  }

  // Función para abrir enlace virtual
  abrirEnlace(enlace: string) {
    if (enlace && (enlace.startsWith('http://') || enlace.startsWith('https://'))) {
      window.open(enlace, '_blank');
    } else if (enlace) {
      window.open('https://' + enlace, '_blank');
    }
  }

  // Función para cargar las entidades y usuarios
  async cargarEntidadesYUsuarios() {
    const loading = await this.loadingController.create({
      message: 'Cargando datos...',
      spinner: 'crescent'
    });
    await loading.present();

    this.catalogoService.getItems('entidades').subscribe({
      next: (entidadesData) => {
        this.entidades = entidadesData || [];
        // Buscar el CNC
        const cncEntidad = this.entidades.find(e => e.Nombre_Entidad.toLowerCase().includes('cnc') ||
          e.Nombre_Entidad.toLowerCase().includes('consejo nacional'));
        if (cncEntidad) {
          this.capacitacion.entidades_encargadas = [cncEntidad.Id_Entidad];
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al cargar las entidades', 'danger');
      }
    });

    this.usuarioService.getUsuarios().subscribe({
      next: (usuariosData) => {
        this.usuarios = usuariosData || [];
        this.usuariosDisponibles = [...this.usuarios];
        loading.dismiss();
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al cargar los usuarios', 'danger');
        loading.dismiss();
      }
    });
  }

  // Validar horarios
  validarHorarios(): boolean {
    if (!this.capacitacion.Hora_Inicio || !this.capacitacion.Hora_Fin) {
      this.mostrarToast('Debe especificar hora de inicio y fin', 'warning');
      return false;
    }

    const horaInicio = this.capacitacion.Hora_Inicio.split(':').map(Number);
    const horaFin = this.capacitacion.Hora_Fin.split(':').map(Number);

    // Validar formato correcto
    if (horaInicio.length !== 2 || horaFin.length !== 2) {
      this.mostrarToast('Formato de hora incorrecto', 'warning');
      return false;
    }

    // Convertir a minutos para comparar más fácilmente
    const minutosInicio = horaInicio[0] * 60 + horaInicio[1];
    const minutosFin = horaFin[0] * 60 + horaFin[1];

    if (minutosFin <= minutosInicio) {
      this.mostrarToast('La hora de finalización debe ser posterior a la hora de inicio', 'warning');
      return false;
    }

    return true;
  }

  // Función para crear una nueva capacitación
  async crearCapacitacion() {
    if (!this.capacitacionForm.valid) {
      this.mostrarToast('Por favor complete todos los campos obligatorios', 'warning');
      return;
    }

    // Validar enlace virtual si la modalidad es virtual
    if (this.capacitacion.Modalidades === 'Virtual' && !this.capacitacion.Enlace_Virtual) {
      this.mostrarToast('Debe proporcionar un enlace para la reunión virtual', 'warning');
      return;
    }

    // Validar horarios
    if (!this.validarHorarios()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando capacitación...',
      spinner: 'crescent'
    });
    await loading.present();

    // Verificar que hay al menos un expositor/responsable
    if (!this.capacitacion.expositores || this.capacitacion.expositores.length === 0) {
      this.mostrarToast('Debe seleccionar al menos un responsable/expositor', 'warning');
      loading.dismiss();
      return;
    }

    // Asegurar que el enlace tenga el formato correcto
    if (this.capacitacion.Enlace_Virtual &&
      !this.capacitacion.Enlace_Virtual.startsWith('http://') &&
      !this.capacitacion.Enlace_Virtual.startsWith('https://')) {
      this.capacitacion.Enlace_Virtual = 'https://' + this.capacitacion.Enlace_Virtual;
    }

    this.capacitacionesService.createCapacitacion(this.capacitacion).subscribe({
      next: async (data: any) => {
        // Data returns created object usually inside array or object depending on backend
        // Assuming data is the object or { data: object }
        const created = Array.isArray(data) ? data[0] : (data.data ? data.data : data);
        const capacitacionId = created?.Id_Capacitacion;

        if (capacitacionId) {
          // Assign Expositores
          for (const expositorId of this.capacitacion.expositores) {
            await this.registrarUsuarioCapacitacion(capacitacionId, expositorId, 'Expositor');
          }
          // Assign Participantes
          if (this.capacitacion.ids_usuarios && this.capacitacion.ids_usuarios.length > 0) {
            for (const usuarioId of this.capacitacion.ids_usuarios) {
              if (!this.capacitacion.expositores.includes(usuarioId)) {
                await this.registrarUsuarioCapacitacion(capacitacionId, usuarioId, 'Participante');
              }
            }
          }
          loading.dismiss();
          this.mostrarToast('Capacitación creada exitosamente', 'success');
          await this.mostrarAlertaExito('Capacitación creada exitosamente', '¿Desea crear otra capacitación?');
        } else {
          loading.dismiss();
          this.mostrarToast('Error: No se recibió confirmación de la base de datos', 'danger');
        }
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error al crear capacitación:', error);
        this.mostrarToast('Error al crear la capacitación: ' + (error.error?.message || error.message), 'danger');
      }
    });

  }

  // Función para registrar la relación entre usuario y capacitación con un rol específico
  async registrarUsuarioCapacitacion(capacitacionId: number, usuarioId: number, rol: string) {
    return new Promise<void>((resolve) => {
      this.capacitacionesService.assignUser(capacitacionId, usuarioId, rol).subscribe({
        next: () => resolve(),
        error: (err) => {
          console.error(`Error assigning ${rol}:`, err);
          resolve(); // Continue anyway
        }
      });
    });
  }

  // Función para cancelar la creación
  async cancelarCreacion() {
    // Verificar si hay datos ingresados
    if (this.hayDatosIngresados()) {
      const alert = await this.alertController.create({
        header: 'Cancelar creación',
        message: '¿Está seguro que desea cancelar? Todos los datos ingresados se perderán.',
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

  async mostrarAlertaExito(mensaje: string, pregunta: string) {
    const alert = await this.alertController.create({
      header: '¡Éxito!',
      message: `${mensaje}. ${pregunta}`,
      buttons: [
        {
          text: 'Volver a la lista',
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

  reiniciarFormulario() {
    const defaultEntidades = [...this.capacitacion.entidades_encargadas];

    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0);
    const horaInicio = now.toTimeString().substr(0, 5);
    now.setHours(now.getHours() + 1);
    const horaFin = now.toTimeString().substr(0, 5);

    this.capacitacion = {
      Nombre_Capacitacion: '',
      Descripcion_Capacitacion: '',
      Fecha_Capacitacion: new Date().toISOString().split('T')[0],
      Lugar_Capacitacion: '',
      Estado: 0,
      Modalidades: 'Virtual',
      Enlace_Virtual: '',
      Hora_Inicio: horaInicio,
      Hora_Fin: horaFin,
      Horas: 0,
      Limite_Participantes: 0,
      entidades_encargadas: defaultEntidades,
      ids_usuarios: [],
      expositores: []
    };

    if (this.capacitacionForm) {
      this.capacitacionForm.resetForm(this.capacitacion);
    }
  }

  hayDatosIngresados(): boolean {
    return !!(
      this.capacitacion.Nombre_Capacitacion ||
      this.capacitacion.Descripcion_Capacitacion ||
      this.capacitacion.Lugar_Capacitacion ||
      // this.capacitacion.Fecha_Capacitacion || // Always has value
      this.capacitacion.Enlace_Virtual ||
      this.capacitacion.Horas > 0 ||
      this.capacitacion.Limite_Participantes > 0 ||
      this.capacitacion.entidades_encargadas.length > 0 ||
      this.capacitacion.ids_usuarios.length > 0 ||
      this.capacitacion.expositores.length > 0
    );
  }

  calcularProgresoFormulario(): number {
    let camposCompletados = 0;
    let totalCampos = 10;

    if (this.capacitacion.Modalidades === 'Virtual') {
      totalCampos = 11;
    }

    if (this.capacitacion.Nombre_Capacitacion) camposCompletados++;
    if (this.capacitacion.Descripcion_Capacitacion) camposCompletados++;
    if (this.capacitacion.Fecha_Capacitacion) camposCompletados++;
    if (this.capacitacion.Hora_Inicio) camposCompletados++;
    if (this.capacitacion.Hora_Fin) camposCompletados++;
    if (this.capacitacion.Lugar_Capacitacion) camposCompletados++;
    if (this.capacitacion.Modalidades) camposCompletados++;
    if (this.capacitacion.Modalidades === 'Virtual' && this.capacitacion.Enlace_Virtual) camposCompletados++;
    if (this.capacitacion.Horas > 0) camposCompletados++;
    if (this.capacitacion.Limite_Participantes > 0) camposCompletados++;
    if (this.capacitacion.entidades_encargadas.length > 0 && this.capacitacion.expositores.length > 0)
      camposCompletados++;

    return Math.round((camposCompletados / totalCampos) * 100);
  }
}
