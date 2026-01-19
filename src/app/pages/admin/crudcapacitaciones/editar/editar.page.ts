import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: false
})
export class EditarPage implements OnInit {
  @ViewChild('capacitacionForm') capacitacionForm!: NgForm;

  cargando: boolean = true;
  capacitacion = {
    Id_Capacitacion: null as number | null,
    Nombre_Capacitacion: '',
    Descripcion_Capacitacion: '',
    Fecha_Capacitacion: '',
    Lugar_Capacitacion: '',
    Estado: 0,
    Modalidades: '',
    Horas: 0,
    Limite_Participantes: 0,
    entidades_encargadas: [] as number[],
    ids_usuarios: [] as number[],
    Certificado: false
  };

  capacitacionOriginal: any = {}; // Para comparar cambios
  entidadesList: any[] = [];
  usuariosList: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    const idCapacitacion = this.activatedRoute.snapshot.paramMap.get('Id_Capacitacion');
    if (idCapacitacion) {
      this.capacitacion.Id_Capacitacion = +idCapacitacion;
      this.cargarDatos();
    } else {
      this.mostrarToast('ID de capacitación no válido', 'danger');
      this.navController.navigateBack('/gestionar-capacitaciones');
    }
  }

  // Función para cargar todos los datos necesarios
  async cargarDatos() {
    const loading = await this.loadingController.create({
      message: 'Cargando datos...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await Promise.all([
        this.cargarCapacitacion(),
        this.cargarEntidadesYUsuarios()
      ]);

      // Guardar copia de la capacitación original para comparar cambios
      this.capacitacionOriginal = JSON.parse(JSON.stringify(this.capacitacion));
      this.cargando = false;
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.mostrarToast('Error al cargar los datos', 'danger');
      this.cargando = false;
    } finally {
      loading.dismiss();
    }
  }

  // Función para cargar los datos de la capacitación
  async cargarCapacitacion() {
    try {
      const { data, error } = await supabase
        .from('Capacitaciones')
        .select('*')
        .eq('Id_Capacitacion', this.capacitacion.Id_Capacitacion)
        .single();

      if (error) {
        console.error('Error al recuperar la capacitación:', error.message);
        this.mostrarToast('Error al cargar la capacitación', 'danger');
        return;
      }

      if (!data) {
        this.mostrarToast('No se encontró la capacitación solicitada', 'warning');
        this.navController.navigateBack('/gestionar-capacitaciones');
        return;
      }

      this.capacitacion = { ...data };
    } catch (error) {
      console.error('Error al cargar los datos de la capacitación:', error);
      throw error; // Propagar el error para manejarlo en cargarDatos()
    }
  }

  // Función para cargar las entidades y usuarios
  async cargarEntidadesYUsuarios() {
    try {
      // Recuperar las entidades
      const { data: entidadesData, error: errorEntidades } = await supabase
        .from('Entidades')
        .select('*')
        .order('Nombre_Entidad', { ascending: true });

      if (errorEntidades) {
        console.error('Error al cargar las entidades:', errorEntidades.message);
        throw new Error('Error al cargar entidades');
      }
      this.entidadesList = entidadesData || [];

      // Recuperar los usuarios
      const { data: usuariosData, error: errorUsuarios } = await supabase
        .from('Usuario')
        .select('*')
        .order('Nombre_Usuario', { ascending: true });

      if (errorUsuarios) {
        console.error('Error al cargar los usuarios:', errorUsuarios.message);
        throw new Error('Error al cargar usuarios');
      }
      this.usuariosList = usuariosData || [];
    } catch (error) {
      console.error('Error al cargar entidades y usuarios:', error);
      throw error; // Propagar el error para manejarlo en cargarDatos()
    }
  }

  // Función para actualizar la capacitación
  async actualizarCapacitacion() {
    if (!this.capacitacionForm.valid) {
      this.mostrarToast('Por favor complete todos los campos obligatorios', 'warning');
      return;
    }

    // Si tiene certificado emitido, mostrar advertencia antes de actualizar
    if (this.capacitacion.Certificado && this.hayBioCambiosCriticos()) {
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

  // Función que verifica si hay cambios en datos críticos para certificados
  hayBioCambiosCriticos(): boolean {
    return (
      this.capacitacion.Nombre_Capacitacion !== this.capacitacionOriginal.Nombre_Capacitacion ||
      this.capacitacion.Fecha_Capacitacion !== this.capacitacionOriginal.Fecha_Capacitacion ||
      this.capacitacion.Lugar_Capacitacion !== this.capacitacionOriginal.Lugar_Capacitacion ||
      this.capacitacion.Horas !== this.capacitacionOriginal.Horas
    );
  }

  // Función para guardar los cambios en la base de datos
  async guardarCambios() {
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data, error } = await supabase
        .from('Capacitaciones')
        .update({
          Nombre_Capacitacion: this.capacitacion.Nombre_Capacitacion,
          Descripcion_Capacitacion: this.capacitacion.Descripcion_Capacitacion,
          Fecha_Capacitacion: this.capacitacion.Fecha_Capacitacion,
          Lugar_Capacitacion: this.capacitacion.Lugar_Capacitacion,
          Estado: this.capacitacion.Estado,
          Modalidades: this.capacitacion.Modalidades,
          Horas: this.capacitacion.Horas,
          Limite_Participantes: this.capacitacion.Limite_Participantes,
          entidades_encargadas: this.capacitacion.entidades_encargadas,
          ids_usuarios: this.capacitacion.ids_usuarios
        })
        .eq('Id_Capacitacion', this.capacitacion.Id_Capacitacion);

      if (error) {
        console.error('Error al actualizar la capacitación:', error.message);
        this.mostrarToast('Error al actualizar la capacitación', 'danger');
        return;
      }

      // Actualizar la capacitación original para futuras comparaciones
      this.capacitacionOriginal = JSON.parse(JSON.stringify(this.capacitacion));
      this.mostrarToast('Capacitación actualizada correctamente', 'success');

      // Si el estado cambió a "Realizada", preguntar por la emisión de certificados
      if (this.capacitacion.Estado === 1 && !this.capacitacion.Certificado) {
        loading.dismiss();
        this.preguntarEmitirCertificados();
      } else {
        // Esperar un momento antes de volver para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          loading.dismiss();
          this.navController.navigateBack('/gestionar-capacitaciones');
        }, 1000);
      }
    } catch (error) {
      console.error('Error al actualizar la capacitación:', error);
      this.mostrarToast('Error al procesar los datos', 'danger');
      loading.dismiss();
    }
  }

  // Función para cancelar la edición
  async cancelarEdicion() {
    // Verificar si hay cambios no guardados
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

  // Función para marcar la capacitación como finalizada
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
            this.capacitacion.Estado = 1; // Marcar como realizada
            await this.guardarCambios();
          }
        }
      ]
    });

    await alert.present();
  }

  // Función para confirmar eliminación de capacitación
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

  // Función para eliminar la capacitación
  async eliminarCapacitacion() {
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
        .eq('Id_Capacitacion', this.capacitacion.Id_Capacitacion);

      if (errorUsuarios) {
        console.error('Error al eliminar registros de usuarios:', errorUsuarios);
        this.mostrarToast('Error al eliminar usuarios asociados', 'danger');
        return;
      }

      // Luego eliminar la capacitación
      const { error } = await supabase
        .from('Capacitaciones')
        .delete()
        .eq('Id_Capacitacion', this.capacitacion.Id_Capacitacion);

      if (error) {
        console.error('Error al eliminar capacitación:', error);
        this.mostrarToast('Error al eliminar la capacitación', 'danger');
        return;
      }

      this.mostrarToast('Capacitación eliminada correctamente', 'success');
      setTimeout(() => {
        this.navController.navigateBack('/gestionar-capacitaciones');
      }, 1500);

    } catch (error) {
      console.error('Error inesperado:', error);
      this.mostrarToast('Error al eliminar datos', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Preguntar si desea emitir certificados ahora
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

  // Ir a la página de emisión de certificados
  irAEmitirCertificados() {
    this.navController.navigateForward(`/gestionar-capacitaciones/visualizarinscritos/${this.capacitacion.Id_Capacitacion}`);
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
}
