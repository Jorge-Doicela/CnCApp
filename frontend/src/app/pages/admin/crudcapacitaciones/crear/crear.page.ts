// crear.page.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: false
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
    try {
      const loading = await this.loadingController.create({
        message: 'Cargando datos...',
        spinner: 'crescent'
      });
      await loading.present();

      // Recuperar las entidades
      const { data: entidadesData, error: errorEntidades } = await supabase
        .from('Entidades')
        .select('*')
        .order('Nombre_Entidad', { ascending: true });

      if (errorEntidades) {
        console.error('Error al cargar las entidades:', errorEntidades.message);
        this.mostrarToast('Error al cargar las entidades', 'danger');
        loading.dismiss();
        return;
      }
      this.entidades = entidadesData || [];

      // Buscar el CNC y asegurarse de que esté seleccionado por defecto
      const cncEntidad = this.entidades.find(e => e.Nombre_Entidad.toLowerCase().includes('cnc') ||
                                               e.Nombre_Entidad.toLowerCase().includes('consejo nacional'));
      if (cncEntidad) {
        this.capacitacion.entidades_encargadas = [cncEntidad.Id_Entidad];
      }

      // Recuperar los usuarios
      const { data: usuariosData, error: errorUsuarios } = await supabase
        .from('Usuario')
        .select('*')
        .order('Nombre_Usuario', { ascending: true });

      if (errorUsuarios) {
        console.error('Error al cargar los usuarios:', errorUsuarios.message);
        this.mostrarToast('Error al cargar los usuarios', 'danger');
        loading.dismiss();
        return;
      }
      this.usuarios = usuariosData || [];
      this.usuariosDisponibles = [...this.usuarios]; // Inicialmente todos están disponibles

      loading.dismiss();
    } catch (error) {
      console.error('Error al cargar entidades y usuarios:', error);
      this.mostrarToast('Error al cargar los datos necesarios', 'danger');
      const loading = await this.loadingController.getTop();
      if (loading) {
        loading.dismiss();
      }
    }
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

    try {
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

      // Formatear las horas como strings simples antes de guardar
      const horaInicio = this.capacitacion.Hora_Inicio; // Ya está en formato correcto (HH:MM)
      const horaFin = this.capacitacion.Hora_Fin;       // Ya está en formato correcto (HH:MM)

      // Crear la capacitación en la base de datos
      const { data, error } = await supabase
        .from('Capacitaciones')
        .insert([{
          Nombre_Capacitacion: this.capacitacion.Nombre_Capacitacion,
          Descripcion_Capacitacion: this.capacitacion.Descripcion_Capacitacion,
          Fecha_Capacitacion: this.capacitacion.Fecha_Capacitacion,
          Lugar_Capacitacion: this.capacitacion.Lugar_Capacitacion,
          Estado: this.capacitacion.Estado,
          Modalidades: this.capacitacion.Modalidades,
          Enlace_Virtual: this.capacitacion.Enlace_Virtual,
          Hora_Inicio: horaInicio,  // String en formato HH:MM
          Hora_Fin: horaFin,        // String en formato HH:MM
          Horas: this.capacitacion.Horas,
          Limite_Participantes: this.capacitacion.Limite_Participantes,
          entidades_encargadas: this.capacitacion.entidades_encargadas,
          ids_usuarios: this.capacitacion.ids_usuarios, // Participantes
          expositores: this.capacitacion.expositores, // Responsables/expositores
          Certificado: false // Por defecto, no tiene certificado
        }])
        .select();

      if (error) {
        console.error('Error al insertar la capacitación:', error.message);
        this.mostrarToast('Error al crear la capacitación', 'danger');
        loading.dismiss();
        return;
      }

      // Si hay datos de la capacitación creada
      if (data && data.length > 0) {
        const capacitacionId = data[0].Id_Capacitacion;

        try {
          // Registrar expositores con rol de "Expositor"
          for (const expositorId of this.capacitacion.expositores) {
            await this.registrarUsuarioCapacitacion(capacitacionId, expositorId, 'Expositor');
          }

          // Registrar participantes seleccionados con rol de "Participante" (si hay)
          if (this.capacitacion.ids_usuarios && this.capacitacion.ids_usuarios.length > 0) {
            for (const usuarioId of this.capacitacion.ids_usuarios) {
              // Evitar duplicar si un usuario es tanto expositor como participante
              if (!this.capacitacion.expositores.includes(usuarioId)) {
                await this.registrarUsuarioCapacitacion(capacitacionId, usuarioId, 'Participante');
              }
            }
          }

          // Mostrar alerta de éxito y luego redirigir
          loading.dismiss();
          this.mostrarToast('Capacitación creada exitosamente', 'success');
          await this.mostrarAlertaExito('Capacitación creada exitosamente', '¿Desea crear otra capacitación?');
        } catch (error) {
          console.error('Error al registrar usuarios:', error);
          // A pesar del error en los usuarios, la capacitación fue creada
          loading.dismiss();
          this.mostrarToast('Capacitación creada, pero hubo problemas al asignar algunos usuarios', 'warning');
          await this.mostrarAlertaExito('Capacitación creada con advertencias', '¿Desea crear otra capacitación?');
        }
      } else {
        loading.dismiss();
        this.mostrarToast('Error: No se recibió confirmación de la base de datos', 'danger');
      }
    } catch (error) {
      console.error('Error al crear la capacitación:', error);
      loading.dismiss();
      this.mostrarToast('Error al procesar los datos', 'danger');
    }
  }

  // Función para registrar la relación entre usuario y capacitación con un rol específico
  async registrarUsuarioCapacitacion(capacitacionId: number, usuarioId: number, rol: string) {
    const { error } = await supabase
      .from('Usuarios_Capacitaciones')
      .insert([{
        Id_Usuario: usuarioId,
        Id_Capacitacion: capacitacionId,
        Rol_Capacitacion: rol,
        Fecha_Asignacion: new Date().toISOString(),
        Asistencia: false // Por defecto, no ha asistido todavía
      }]);

    if (error) {
      console.error(`Error al registrar ${rol} (ID: ${usuarioId}):`, error.message);
      throw new Error(`Error al registrar usuario: ${error.message}`);
    }
  }

  // Función para cancelar la creación
  async cancelarCreacion() {
    // Verificar si hay cambios en el formulario
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

  // Función para mostrar un mensaje de toast
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

  // Función para mostrar alerta de éxito con opciones
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

  // Función para reiniciar el formulario
  reiniciarFormulario() {
    // Conservar las entidades por defecto (CNC)
    const defaultEntidades = [...this.capacitacion.entidades_encargadas];

    // Establecer horas por defecto nuevamente
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0); // Próxima hora en punto

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

  // Función para verificar si hay datos ingresados
  hayDatosIngresados(): boolean {
    return !!(
      this.capacitacion.Nombre_Capacitacion ||
      this.capacitacion.Descripcion_Capacitacion ||
      this.capacitacion.Lugar_Capacitacion ||
      this.capacitacion.Fecha_Capacitacion ||
      this.capacitacion.Hora_Inicio ||
      this.capacitacion.Hora_Fin ||
      this.capacitacion.Enlace_Virtual ||
      this.capacitacion.Horas > 0 ||
      this.capacitacion.Limite_Participantes > 0 ||
      this.capacitacion.entidades_encargadas.length > 0 ||
      this.capacitacion.ids_usuarios.length > 0 ||
      this.capacitacion.expositores.length > 0
    );
  }

  // Función para calcular el progreso del formulario (para la barra de progreso)
  calcularProgresoFormulario(): number {
    let camposCompletados = 0;
    let totalCampos = 10; // Base de campos requeridos (añadimos 2 más por horario)

    // Si es modalidad virtual, añadimos un campo más al total (enlace)
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
