// visualizarinscritos.page.ts
import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ToastController, NavController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-visualizarinscritos',
  templateUrl: './visualizarinscritos.page.html',
  styleUrls: ['./visualizarinscritos.page.scss'],
  standalone: false
})
export class VisualizarinscritosPage implements OnInit {
  idCapacitacion: number | null = null;
  usuariosInscritos: any[] = [];
  participantesFiltrados: any[] = [];
  expositores: any[] = []; // Lista específica para expositores
  infoCapacitacion: any = null;
  entidadesEncargadas: any[] = []; // Lista de entidades encargadas
  cargando: boolean = true;

  // Filtros
  terminoBusqueda: string = '';
  filtroAsistencia: string = 'todos';

  // Lista de usuarios disponibles para agregar
  usuariosDisponibles: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(async params => {
      this.idCapacitacion = +params['Id_Capacitacion'];
      if (!isNaN(this.idCapacitacion)) {
        await this.cargarDatos();
      } else {
        this.mostrarToast('ID de capacitación no válido', 'danger');
        this.navController.navigateBack('/gestionar-capacitaciones');
      }
    });
  }

  // Función para cargar todos los datos necesarios
  async cargarDatos() {
    try {
      const loading = await this.loadingController.create({
        message: 'Cargando datos...',
        spinner: 'crescent'
      });
      await loading.present();

      // Cargar información de la capacitación primero
      await this.cargarInfoCapacitacion();

      // Luego cargar entidades encargadas y usuarios en paralelo
      await Promise.all([
        this.cargarEntidadesEncargadas(),
        this.cargarUsuariosInscritos(),
        this.cargarUsuariosDisponibles()
      ]);

      this.filtrarParticipantes();
      this.cargando = false;
      loading.dismiss();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.mostrarToast('Error al cargar los datos', 'danger');
      this.cargando = false;
      const loading = await this.loadingController.getTop();
      if (loading) {
        loading.dismiss();
      }
    }
  }

  // Cargar información de la capacitación
  async cargarInfoCapacitacion() {
    try {
      const { data, error } = await supabase
        .from('Capacitaciones')
        .select('*')
        .eq('Id_Capacitacion', this.idCapacitacion)
        .single();

      if (error) {
        console.error('Error al obtener información de la capacitación:', error.message);
        throw error;
      }

      this.infoCapacitacion = data;

      // Log para depuración
      console.log('Información de capacitación cargada:', this.infoCapacitacion);
    } catch (error) {
      console.error('Error al cargar info de capacitación:', error);
      throw error;
    }
  }

  // Cargar las entidades encargadas
  async cargarEntidadesEncargadas() {
    try {
      if (!this.infoCapacitacion || !this.infoCapacitacion.entidades_encargadas) {
        return;
      }

      // Si no hay entidades, no hacer nada
      if (this.infoCapacitacion.entidades_encargadas.length === 0) {
        this.entidadesEncargadas = [];
        return;
      }

      // Buscar las entidades por ID
      const { data, error } = await supabase
        .from('Entidades')
        .select('*')
        .in('Id_Entidad', this.infoCapacitacion.entidades_encargadas);

      if (error) {
        console.error('Error al cargar entidades encargadas:', error.message);
        throw error;
      }

      this.entidadesEncargadas = data || [];

      // Log para depuración
      console.log('Entidades encargadas cargadas:', this.entidadesEncargadas);
    } catch (error) {
      console.error('Error al cargar entidades encargadas:', error);
      throw error;
    }
  }

  // Cargar usuarios inscritos y expositores
  async cargarUsuariosInscritos() {
    try {
      // First check if we have data in the junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from('Usuarios_Capacitaciones')
        .select('*')
        .eq('Id_Capacitacion', this.idCapacitacion);

      if (junctionError) {
        console.error('Error checking junction table:', junctionError);
        throw junctionError;
      }

      // If we don't have data in the junction table, we need to get it from the Capacitaciones table
      if (!junctionData || junctionData.length === 0) {
        // Get the data from Capacitaciones
        const { data: capacitacionData, error: capacitacionError } = await supabase
          .from('Capacitaciones')
          .select('ids_usuarios, expositores')
          .eq('Id_Capacitacion', this.idCapacitacion)
          .single();

        if (capacitacionError) {
          console.error('Error getting capacitacion data:', capacitacionError);
          throw capacitacionError;
        }

        // Create records in the junction table
        if (capacitacionData) {
          const participanteIds = capacitacionData.ids_usuarios || [];
          const expositorIds = capacitacionData.expositores || [];

          // Create entries for participants
          for (const participanteId of participanteIds) {
            // Skip null IDs and ensure idCapacitacion is not null
            if (participanteId !== null && this.idCapacitacion !== null) {
              await this.registrarUsuarioCapacitacion(this.idCapacitacion, participanteId as number, 'Participante');
            }
          }

          // Create entries for presenters
          for (const expositorId of expositorIds) {
            // Skip null IDs and ensure idCapacitacion is not null
            if (expositorId !== null && this.idCapacitacion !== null) {
              await this.registrarUsuarioCapacitacion(this.idCapacitacion, expositorId as number, 'Expositor');
            }
          }

          // Fetch the newly created entries
          if (this.idCapacitacion !== null) {
            const { data: newJunctionData, error: newJunctionError } = await supabase
              .from('Usuarios_Capacitaciones')
              .select('*')
              .eq('Id_Capacitacion', this.idCapacitacion);

            if (newJunctionError) {
              console.error('Error fetching new junction data:', newJunctionError);
              throw newJunctionError;
            }

            // Process the data as before
            const todosUsuarios = newJunctionData || [];
            this.expositores = todosUsuarios.filter((u: any) => u.Rol_Capacitacion === 'Expositor');
            this.usuariosInscritos = todosUsuarios.filter((u: any) => u.Rol_Capacitacion !== 'Expositor');
          }
        }
      } else {
        // Process the data as before
        const todosUsuarios = junctionData || [];
        this.expositores = todosUsuarios.filter((u: any) => u.Rol_Capacitacion === 'Expositor');
        this.usuariosInscritos = todosUsuarios.filter((u: any) => u.Rol_Capacitacion !== 'Expositor');
      }

      // Recuperar nombres de usuario para ambos grupos
      await this.recuperarNombreUsuario();
    } catch (error) {
      console.error('Error al cargar usuarios inscritos:', error);
      throw error;
    }
  }

  // Helper function to register users in the junction table
  async registrarUsuarioCapacitacion(capacitacionId: number, usuarioId: number, rol: string) {
    try {
      const { error } = await supabase
        .from('Usuarios_Capacitaciones')
        .insert([{
          Id_Usuario: usuarioId,
          Id_Capacitacion: capacitacionId,
          Rol_Capacitacion: rol,
          Fecha_Asignacion: new Date().toISOString(),
          Asistencia: false
        }]);

      if (error) {
        console.error(`Error al registrar ${rol}:`, error.message);
        throw error;
      }
    } catch (error) {
      console.error(`Error al registrar ${rol}:`, error);
      throw error;
    }
  }

  // Recuperar nombres de usuarios
  async recuperarNombreUsuario() {
    try {
      // Recuperar nombres para participantes
      for (const usuario of this.usuariosInscritos) {
        const { data, error } = await supabase
          .from('Usuario')
          .select('*') // Seleccionar todos los campos para tener información completa
          .eq('Id_Usuario', usuario.Id_Usuario)
          .single();

        if (error) {
          console.error(`Error al obtener información del usuario ${usuario.Id_Usuario}:`, error.message);
          continue;
        }

        // Asignar nombre y otros datos relevantes
        if (data) {
          usuario.Nombre_Usuario = data.Nombre_Usuario;
          usuario.Email = data.Email || '-'; // Si existe campo email
          usuario.Cargo = data.Cargo || '-'; // Si existe campo cargo
          usuario.Entidad = data.Entidad || '-'; // Si existe campo entidad
        }
      }

      // Recuperar nombres para expositores
      for (const expositor of this.expositores) {
        const { data, error } = await supabase
          .from('Usuario')
          .select('*') // Seleccionar todos los campos para tener información completa
          .eq('Id_Usuario', expositor.Id_Usuario)
          .single();

        if (error) {
          console.error(`Error al obtener información del expositor ${expositor.Id_Usuario}:`, error.message);
          continue;
        }

        // Asignar nombre y otros datos relevantes
        if (data) {
          expositor.Nombre_Usuario = data.Nombre_Usuario;
          expositor.Email = data.Email || '-'; // Si existe campo email
          expositor.Cargo = data.Cargo || '-'; // Si existe campo cargo
          expositor.Entidad = data.Entidad || '-'; // Si existe campo entidad
        }
      }

      // Log para depuración
      console.log('Nombres de usuarios recuperados para participantes:', this.usuariosInscritos);
      console.log('Nombres de usuarios recuperados para expositores:', this.expositores);
    } catch (error) {
      console.error('Error al cargar los nombres de los usuarios:', error);
      throw error;
    }
  }

  // Fix for the idsInscritos type issue
  async cargarUsuariosDisponibles() {
    try {
      // Obtener todos los usuarios
      const { data: todosUsuarios, error: errorUsuarios } = await supabase
        .from('Usuario')
        .select('*')
        .order('Nombre_Usuario', { ascending: true });

      if (errorUsuarios) {
        console.error('Error al obtener usuarios:', errorUsuarios.message);
        throw errorUsuarios;
      }

      // Obtener IDs de los usuarios ya inscritos (tanto participantes como expositores)
      const idsInscritos: number[] = []; // Fix: explicitly declare array type

      // Recopilamos IDs de los participantes inscritos
      const { data: usuariosCapacitacion, error } = await supabase
        .from('Usuarios_Capacitaciones')
        .select('Id_Usuario')
        .eq('Id_Capacitacion', this.idCapacitacion);

      if (error) {
        console.error('Error al obtener IDs de inscritos:', error.message);
      } else if (usuariosCapacitacion) {
        usuariosCapacitacion.forEach((u: any) => idsInscritos.push(u.Id_Usuario));
      }

      // Filtrar los usuarios que NO están en la lista de inscritos
      this.usuariosDisponibles = todosUsuarios.filter((u: any) => !idsInscritos.includes(u.Id_Usuario));

      // Log para depuración
      console.log('Usuarios disponibles cargados:', this.usuariosDisponibles);
    } catch (error) {
      console.error('Error al cargar usuarios disponibles:', error);
      throw error;
    }
  }

  // Filtrar participantes según los criterios
  filtrarParticipantes() {
    let resultado = [...this.usuariosInscritos];

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      resultado = resultado.filter(u =>
        (u.Nombre_Usuario?.toLowerCase().includes(termino) || false) ||
        (u.Rol_Capacitacion?.toLowerCase().includes(termino) || false)
      );
    }

    // Filtrar por asistencia
    if (this.filtroAsistencia === 'asistentes') {
      resultado = resultado.filter(u => u.Asistencia === true);
    } else if (this.filtroAsistencia === 'ausentes') {
      resultado = resultado.filter(u => u.Asistencia === false);
    }

    this.participantesFiltrados = resultado;

    // Log para depuración
    console.log('Participantes filtrados:', this.participantesFiltrados);
  }

  // Limpiar filtros
  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.filtroAsistencia = 'todos';
    this.filtrarParticipantes();
  }

  // Obtener texto del estado
  getEstadoTexto(estado: number): string {
    switch (estado) {
      case 0: return 'Pendiente';
      case 1: return 'Realizada';
      case 2: return 'Cancelada';
      default: return 'Desconocido';
    }
  }

  // Obtener total de asistentes
  obtenerTotalAsistentes(): number {
    return this.usuariosInscritos.filter(u => u.Asistencia === true).length;
  }

  // Actualizar asistencia de un usuario
  async actualizarAsistencia(usuario: any) {
    try {
      const { error } = await supabase
        .from('Usuarios_Capacitaciones')
        .update({ Asistencia: usuario.Asistencia })
        .eq('Id_Usuario_Conferencia', usuario.Id_Usuario_Conferencia);

      if (error) {
        console.error(`Error al actualizar asistencia:`, error.message);
        this.mostrarToast('Error al actualizar asistencia', 'danger');
        return;
      }

      this.mostrarToast(`Asistencia actualizada correctamente`, 'success');
    } catch (error) {
      console.error('Error inesperado:', error);
      this.mostrarToast('Error al actualizar asistencia', 'danger');
    }
  }

  // Marcar a todos como asistentes
  async marcarTodosAsistieron() {
    try {
      const alert = await this.alertController.create({
        header: 'Confirmar acción',
        message: '¿Está seguro de marcar a todos los participantes como asistentes?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Confirmar',
            handler: async () => {
              // Marcar en la interfaz
              this.usuariosInscritos.forEach(usuario => usuario.Asistencia = true);

              // Actualizar en la base de datos
              const { error } = await supabase
                .from('Usuarios_Capacitaciones')
                .update({ Asistencia: true })
                .eq('Id_Capacitacion', this.idCapacitacion)
                .neq('Rol_Capacitacion', 'Expositor'); // No afectar a los expositores

              if (error) {
                console.error('Error al marcar todos como asistentes:', error.message);
                this.mostrarToast('Error al actualizar asistencias', 'danger');
                return;
              }

              this.mostrarToast('Todos los participantes fueron marcados como asistentes', 'success');
              this.filtrarParticipantes();
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.error('Error inesperado:', error);
      this.mostrarToast('Error al actualizar asistencia masiva', 'danger');
    }
  }

  // Mostrar confirmación para emitir certificados
  async mostrarConfirmacion() {
    // Obtener usuarios que no asistieron
    const usuariosNoAsistieron = this.usuariosInscritos.filter(u => u.Asistencia === false);

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
            this.emitirCertificados();
          }
        }
      ]
    });

    await alert.present();
  }

  // Emitir certificados
  async emitirCertificados() {
    try {
      // 1. Eliminar usuarios sin asistencia
      const usuariosNoAsistieron = this.usuariosInscritos.filter(u => u.Asistencia === false);

      if (usuariosNoAsistieron.length > 0) {
        const idsEliminar = usuariosNoAsistieron.map(u => u.Id_Usuario_Conferencia);

        const { error: errorEliminar } = await supabase
          .from('Usuarios_Capacitaciones')
          .delete()
          .in('Id_Usuario_Conferencia', idsEliminar);

        if (errorEliminar) {
          console.error('Error al eliminar usuarios sin asistencia:', errorEliminar);
          this.mostrarToast('Error al procesar usuarios sin asistencia', 'danger');
          return;
        }
      }

      // 2. Marcar capacitación con certificado emitido
      const { error: errorCertificado } = await supabase
        .from('Capacitaciones')
        .update({ Certificado: true })
        .eq('Id_Capacitacion', this.idCapacitacion);

      if (errorCertificado) {
        console.error('Error al actualizar estado de certificado:', errorCertificado);
        this.mostrarToast('Error al emitir certificados', 'danger');
        return;
      }

      // 3. Actualizar datos locales
      this.infoCapacitacion.Certificado = true;
      this.usuariosInscritos = this.usuariosInscritos.filter(u => u.Asistencia === true);
      this.filtrarParticipantes();

      // 4. Mostrar mensaje de éxito
      this.mostrarToast('Certificados emitidos correctamente', 'success');

    } catch (error) {
      console.error('Error al emitir certificados:', error);
      this.mostrarToast('Error al procesar certificados', 'danger');
    }
  }

  // Confirmar eliminación de participante
  async confirmarEliminar(usuario: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de eliminar a ${usuario.Nombre_Usuario} de la lista de participantes?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarParticipante(usuario);
          }
        }
      ]
    });

    await alert.present();
  }

  // Eliminar participante
  async eliminarParticipante(usuario: any) {
    try {
      const { error } = await supabase
        .from('Usuarios_Capacitaciones')
        .delete()
        .eq('Id_Usuario_Conferencia', usuario.Id_Usuario_Conferencia);

      if (error) {
        console.error('Error al eliminar participante:', error);
        this.mostrarToast('Error al eliminar participante', 'danger');
        return;
      }

      // Actualizar listas locales
      this.usuariosInscritos = this.usuariosInscritos.filter(
        u => u.Id_Usuario_Conferencia !== usuario.Id_Usuario_Conferencia
      );
      this.filtrarParticipantes();

      // Actualizar la lista de disponibles - asegurarse de que el usuario eliminado esté allí
      this.actualizarListadoDisponibles(usuario.Id_Usuario);

      this.mostrarToast('Participante eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error inesperado:', error);
      this.mostrarToast('Error al eliminar participante', 'danger');
    }
  }

  // Actualizar la lista de usuarios disponibles
  async actualizarListadoDisponibles(idUsuario: number) {
    // Verificar si el usuario ya está en la lista de disponibles
    const usuarioExistente = this.usuariosDisponibles.find(u => u.Id_Usuario === idUsuario);

    if (!usuarioExistente) {
      try {
        const { data, error } = await supabase
          .from('Usuario')
          .select('*')
          .eq('Id_Usuario', idUsuario)
          .single();

        if (error) {
          console.error('Error al obtener información del usuario:', error);
          return;
        }

        if (data) {
          this.usuariosDisponibles.push(data);
          // Ordenar alfabéticamente
          this.usuariosDisponibles.sort((a, b) =>
            a.Nombre_Usuario.localeCompare(b.Nombre_Usuario)
          );
        }
      } catch (error) {
        console.error('Error al actualizar usuarios disponibles:', error);
      }
    }
  }

  // Agregar nuevo participante
  async agregarParticipante() {
    if (this.usuariosDisponibles.length === 0) {
      this.mostrarToast('No hay usuarios disponibles para agregar', 'warning');
      return;
    }

    // Crear inputs con los tipos correctos
    const radioInputs = this.usuariosDisponibles.map(u => ({
      name: 'usuario',
      type: 'radio' as const,
      label: u.Nombre_Usuario,
      value: u.Id_Usuario.toString()
    }));

    // Create alert with correct input configuration
    const alert = await this.alertController.create({
      header: 'Agregar Participante',
      inputs: radioInputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: async (data) => {
            if (!data.usuario) {
              this.mostrarToast('Debe seleccionar un usuario', 'warning');
              return false;
            }

            // Show a second alert for role selection after user is selected
            const roleAlert = await this.alertController.create({
              header: 'Seleccionar Rol',
              inputs: [
                {
                  name: 'rol',
                  type: 'radio',
                  label: 'Participante',
                  value: 'Participante',
                  checked: true
                },
                {
                  name: 'rol',
                  type: 'radio',
                  label: 'Expositor',
                  value: 'Expositor'
                }
              ],
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel'
                },
                {
                  text: 'Confirmar',
                  handler: async (roleData) => {
                    const idUsuario = parseInt(data.usuario);
                    const rol = roleData.rol || 'Participante';
                    await this.guardarNuevoParticipante(idUsuario, rol);
                  }
                }
              ]
            });

            await roleAlert.present();
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  // Guardar nuevo participante en la base de datos
  async guardarNuevoParticipante(idUsuario: number, rolCapacitacion: string) {
    const loading = await this.loadingController.create({
      message: 'Agregando participante...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Verificar si ya existe el participante
      const { data: existente, error: errorExistente } = await supabase
        .from('Usuarios_Capacitaciones')
        .select('*')
        .eq('Id_Capacitacion', this.idCapacitacion)
        .eq('Id_Usuario', idUsuario);

      if (errorExistente) {
        console.error('Error al verificar participante:', errorExistente);
        this.mostrarToast('Error al verificar participante', 'danger');
        loading.dismiss();
        return;
      }

      if (existente && existente.length > 0) {
        this.mostrarToast('Este usuario ya está inscrito en la capacitación', 'warning');
        loading.dismiss();
        return;
      }

      // Insertar nuevo participante en la base de datos
      const { data, error } = await supabase
        .from('Usuarios_Capacitaciones')
        .insert([{
          Id_Capacitacion: this.idCapacitacion,
          Id_Usuario: idUsuario,
          Rol_Capacitacion: rolCapacitacion,
          Fecha_Asignacion: new Date().toISOString(),
          Asistencia: false
        }])
        .select();

      if (error) {
        console.error('Error al agregar participante:', error);
        this.mostrarToast('Error al agregar participante', 'danger');
        loading.dismiss();
        return;
      }

      // Obtener información completa del usuario
      const { data: infoUsuario, error: errorUsuario } = await supabase
        .from('Usuario')
        .select('*')
        .eq('Id_Usuario', idUsuario)
        .single();

      if (errorUsuario) {
        console.error('Error al obtener información del usuario:', errorUsuario);
        this.mostrarToast('Error al obtener información del usuario', 'warning');
        loading.dismiss();
        return;
      }

      // Actualizar las listas locales
      if (data && data.length > 0 && infoUsuario) {
        const nuevoParticipante = {
          ...data[0],
          Nombre_Usuario: infoUsuario.Nombre_Usuario,
          Email: infoUsuario.Email || '-',
          Cargo: infoUsuario.Cargo || '-',
          Entidad: infoUsuario.Entidad || '-'
        };

        // Agregar a la lista correcta según el rol
        if (rolCapacitacion === 'Expositor') {
          this.expositores.push(nuevoParticipante);
        } else {
          this.usuariosInscritos.push(nuevoParticipante);
          this.filtrarParticipantes();
        }

        // Quitar de la lista de disponibles
        this.usuariosDisponibles = this.usuariosDisponibles.filter(u => u.Id_Usuario !== idUsuario);
      }

      this.mostrarToast('Participante agregado correctamente', 'success');
    } catch (error) {
      console.error('Error inesperado:', error);
      this.mostrarToast('Error al agregar participante', 'danger');
    } finally {
      loading.dismiss();
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
}
