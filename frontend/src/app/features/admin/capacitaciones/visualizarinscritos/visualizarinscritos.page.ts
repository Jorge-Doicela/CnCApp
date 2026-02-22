import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ToastController, NavController, LoadingController } from '@ionic/angular';
import { CapacitacionesService } from 'src/app/features/admin/capacitaciones/services/capacitaciones.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-visualizarinscritos',
  templateUrl: './visualizarinscritos.page.html',
  styleUrls: ['./visualizarinscritos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
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

  private capacitacionesService = inject(CapacitacionesService);
  private catalogoService = inject(CatalogoService);
  private usuarioService = inject(UsuarioService);

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController,
    private loadingController: LoadingController,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const idCapacitacion = +this.activatedRoute.snapshot.params['id'];
    this.idCapacitacion = idCapacitacion;

    if (!isNaN(this.idCapacitacion) && this.idCapacitacion > 0) {
      this.cargarDatos();
    } else {
      this.mostrarToast('ID de capacitación no válido', 'danger');
      this.navController.navigateBack('/gestionar-capacitaciones');
    }
  }

  // Función para cargar todos los datos necesarios
  async cargarDatos() {
    let loading: HTMLIonLoadingElement | null = null;
    try {
      loading = await this.loadingController.create({
        message: 'Cargando datos...',
        spinner: 'crescent'
      });
      await loading.present();

      // 1. Cargar información de la capacitación primero (Fundamental)
      await this.cargarInfoCapacitacion();

      // 2. Cargar usuarios inscritos (Necesario para filtrar disponibles)
      await this.cargarUsuariosInscritos();

      // 3. Cargar el resto en paralelo (Entidades y Disponibles - este ultimo usa inscritos)
      await Promise.all([
        this.cargarEntidadesEncargadas(),
        this.cargarUsuariosDisponibles()
      ]);

      this.filtrarParticipantes();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.mostrarToast('Error al cargar los datos. Por favor intente nuevamente.', 'danger');
    } finally {
      this.cargando = false;
      this.cd.detectChanges(); // Forzar actualización de la vista
      if (loading) {
        await loading.dismiss();
      } else {
        // Fallback incase loading wasn't assigned but created
        const topLoading = await this.loadingController.getTop();
        if (topLoading) {
          await topLoading.dismiss();
        }
      }
    }
  }

  // Cargar información de la capacitación
  async cargarInfoCapacitacion() {
    if (!this.idCapacitacion) return;
    try {
      const data = await firstValueFrom(this.capacitacionesService.getCapacitacion(this.idCapacitacion));
      this.infoCapacitacion = data;
      console.log('Información de capacitación cargada:', this.infoCapacitacion);
    } catch (error) {
      console.error('Error al cargar info de capacitación:', error);
      throw error;
    }
  }

  // Cargar las entidades encargadas
  async cargarEntidadesEncargadas() {
    if (!this.infoCapacitacion || !this.infoCapacitacion.entidades_encargadas || this.infoCapacitacion.entidades_encargadas.length === 0) {
      this.entidadesEncargadas = [];
      return;
    }

    // Simplification: Fetch all entities and filter. Ideally backend should support fetching by IDs or we make parallel requests.
    // For now, assuming CatalogoService doesn't have "getByIds", we will fetch all and filter client side or loop.
    // Ideally backend endpoint for entities should support filtering.
    // We will fetch all entities (cached by service ideally or just fetch) and filter.
    try {
      const entidades = await firstValueFrom(this.catalogoService.getItems('entidades'));
      this.entidadesEncargadas = entidades.filter(e => this.infoCapacitacion.entidades_encargadas.includes(e.Id_Entidad));
    } catch (error) {
      console.error('Error al cargar entidades:', error);
    }
  }

  // Cargar usuarios inscritos y expositores
  async cargarUsuariosInscritos() {
    if (!this.idCapacitacion) return;
    try {
      const todosUsuarios = await firstValueFrom(this.capacitacionesService.getInscritos(this.idCapacitacion));

      // Mapear respuesta del backend a la estructura que espera la vista
      const mappedUsuarios = todosUsuarios.map((u: any) => ({
        id: u.id, // ID de la inscripción (Relación)
        usuarioId: u.usuarioId, // ID del Usuario
        nombre: u.usuario?.nombre, // Para lógica interna
        Nombre_Usuario: u.usuario?.nombre, // Para el template (PascalCase)
        rolCapacitacion: u.rolCapacitacion,
        Rol_Capacitacion: u.rolCapacitacion, // Para el template
        asistio: u.asistio,
        Asistencia: u.asistio, // Para el template
        Email: u.usuario?.email,
        Cargo: u.usuario?.cargo, // Si existe en el objeto usuario
        Entidad: u.usuario?.entidad?.nombre
      }));

      this.expositores = mappedUsuarios.filter((u: any) => u.rolCapacitacion === 'Expositor');
      this.usuariosInscritos = mappedUsuarios.filter((u: any) => u.rolCapacitacion !== 'Expositor');

    } catch (error) {
      console.error('Error al cargar usuarios inscritos:', error);
      throw error;
    }
  }

  async cargarUsuariosDisponibles() {
    try {
      const todosUsuarios = await firstValueFrom(this.usuarioService.getUsuarios());

      // Obtener IDs de los usuarios ya inscritos (tanto participantes como expositores)
      const idsInscritos: number[] = [];

      // Add already loaded identifiers (User IDs)
      this.expositores.forEach(u => idsInscritos.push(u.usuarioId));
      this.usuariosInscritos.forEach(u => idsInscritos.push(u.usuarioId));

      // Filtrar los usuarios que NO están en la lista de inscritos
      this.usuariosDisponibles = todosUsuarios.filter((u: any) => !idsInscritos.includes(u.id));

      // Sort
      this.usuariosDisponibles.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );

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
        (u.nombre?.toLowerCase().includes(termino) || false) ||
        (u.rolCapacitacion?.toLowerCase().includes(termino) || false)
      );
    }

    // Filtrar por asistencia
    if (this.filtroAsistencia === 'asistentes') {
      resultado = resultado.filter(u => u.asistio === true);
    } else if (this.filtroAsistencia === 'ausentes') {
      resultado = resultado.filter(u => u.asistio === false);
    }

    this.participantesFiltrados = resultado;
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
    return this.usuariosInscritos.filter(u => u.asistio === true).length;
  }

  // Actualizar asistencia de un usuario
  async actualizarAsistencia(usuario: any) {
    try {
      // Assuming 'id' is the PK of the junction table (UsuarioCapacitacion)
      await firstValueFrom(this.capacitacionesService.updateAttendance(usuario.id, usuario.asistio));
      this.mostrarToast(`Asistencia actualizada correctamente`, 'success');
    } catch (error) {
      console.error('Error inesperado:', error);
      this.mostrarToast('Error al actualizar asistencia', 'danger');
      // Revert change in UI if failed? Angular binding might keep it checked.
      // Ideally we reload or revert.
    }
  }

  // Marcar a todos como asistentes
  async marcarTodosAsistieron() {
    if (!this.idCapacitacion) return;
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
              if (this.idCapacitacion) {
                this.usuariosInscritos.forEach(usuario => usuario.asistio = true);

                await firstValueFrom(this.capacitacionesService.updateAllAttendance(this.idCapacitacion, true));

                this.mostrarToast('Todos los participantes fueron marcados como asistentes', 'success');
                this.filtrarParticipantes();
              }
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
    const usuariosNoAsistieron = this.usuariosInscritos.filter(u => u.asistio === false);

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
    if (!this.idCapacitacion) return;
    try {
      // 1. Eliminar usuarios sin asistencia
      await firstValueFrom(this.capacitacionesService.deleteUsuariosNoAsistieron(this.idCapacitacion));

      // 2. Marcar capacitación con certificado emitido
      // We can reuse updateCapacitacion from the service, but we only want to update one field.
      // Assuming updateCapacitacion handles partial updates or we send full object.
      // Best to send what changed.
      const updatedCap = { ...this.infoCapacitacion, Certificado: true };
      await firstValueFrom(this.capacitacionesService.updateCapacitacion(this.idCapacitacion, updatedCap));

      // 3. Actualizar datos locales
      this.infoCapacitacion.certificado = true;
      this.usuariosInscritos = this.usuariosInscritos.filter(u => u.asistio === true);
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
      message: `¿Está seguro de eliminar a ${usuario.nombre} de la lista de participantes?`,
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
      await firstValueFrom(this.capacitacionesService.deleteUsuarioCapacitacion(usuario.id));

      // Actualizar listas locales
      this.usuariosInscritos = this.usuariosInscritos.filter(
        u => u.id !== usuario.id
      );
      this.filtrarParticipantes();

      // Actualizar la lista de disponibles - asegurarse de que el usuario eliminado esté allí
      this.actualizarListadoDisponibles(usuario.usuarioId); // Assuming junction has usuarioId

      this.mostrarToast('Participante eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error inesperado:', error);
      this.mostrarToast('Error al eliminar participante', 'danger');
    }
  }

  // Actualizar la lista de usuarios disponibles
  async actualizarListadoDisponibles(idUsuario: number) {
    // Verificar si el usuario ya está en la lista de disponibles
    const usuarioExistente = this.usuariosDisponibles.find(u => u.id === idUsuario);

    if (!usuarioExistente) {
      try {
        const data = await firstValueFrom(this.usuarioService.getUsuario(idUsuario));

        if (data) {
          this.usuariosDisponibles.push(data);
          // Ordenar alfabéticamente
          this.usuariosDisponibles.sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
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
      label: u.nombre,
      value: u.id.toString()
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
    if (!this.idCapacitacion) return;
    const loading = await this.loadingController.create({
      message: 'Agregando participante...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Insertar nuevo participante en la base de datos
      await firstValueFrom(this.capacitacionesService.assignUser(this.idCapacitacion, idUsuario, rolCapacitacion));

      // Obtener información completa del usuario
      const infoUsuario = await firstValueFrom(this.usuarioService.getUsuario(idUsuario));

      // Actualizar las listas locales
      if (infoUsuario) {
        // We need the ID of the new relationship (Id_Usuario_Conferencia).
        // Ideally the service 'assignUser' returns the created object with the ID.
        // Assuming it does.
        // For now, reload the list to be safe and get the ID? 
        // Or just fetch the list again is safer to get the PK.
        await this.cargarUsuariosInscritos();
        this.filtrarParticipantes();

        // Quitar de la lista de disponibles
        this.usuariosDisponibles = this.usuariosDisponibles.filter(u => u.id !== idUsuario);
      }

      this.mostrarToast('Participante agregado correctamente', 'success');
    } catch (error) {
      console.error('Error inesperado:', error);
      this.mostrarToast('Error al agregar participante', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Exportar lista de participantes a CSV
  exportarLista() {
    if (this.participantesFiltrados.length === 0) return;

    try {
      const headers = ['Nombre', 'Asistencia', 'Rol', 'Email', 'Cargo', 'Entidad'];
      const data = this.participantesFiltrados.map(u => [
        u.Nombre_Usuario,
        u.Asistencia ? 'Asistió' : 'No asistió',
        u.Rol_Capacitacion || 'Participante',
        u.Email || '-',
        u.Cargo || '-',
        u.Entidad || '-'
      ]);

      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for Excel Spanish characters
      csvContent += headers.join(',') + "\r\n";

      data.forEach(row => {
        csvContent += row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',') + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const fileName = `participantes-${this.infoCapacitacion?.nombre || 'capacitacion'}-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.mostrarToast('Lista exportada correctamente', 'success');
    } catch (error) {
      console.error('Error al exportar lista:', error);
      this.mostrarToast('Error al exportar la lista', 'danger');
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
