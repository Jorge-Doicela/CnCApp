import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crudroles',
  templateUrl: './crudroles.page.html',
  styleUrls: ['./crudroles.page.scss'],
  standalone: false
})
export class CRUDRolesPage implements OnInit {
  Roles: any[] = [];
  rolesFiltrados: any[] = [];
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  cargando: boolean = true;
  rolesActivos: number = 0;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  // Método principal para cargar todos los datos necesarios
  async cargarDatos() {
    this.cargando = true;
    await this.RecuperarRoles();
    this.cargando = false;
  }

  async RecuperarRoles() {
    try {
      const { data, error } = await supabase.from('Rol').select('*');
      if (error) {
        console.error('Error al obtener los roles:', error.message);
        this.presentToast('Error al cargar los roles', 'danger');
        return;
      }
      this.Roles = data ?? [];
      this.rolesFiltrados = [...this.Roles];
      this.calcularRolesActivos();
      console.log('Roles cargados:', this.Roles);
    } catch (error) {
      console.error('Error inesperado:', error);
      this.presentToast('Error inesperado al cargar los datos', 'danger');
    }
  }

  calcularRolesActivos() {
    this.rolesActivos = this.Roles.filter(rol => rol.estado).length;
  }

  obtenerTotalModulos(): number {
    let totalModulos = 0;
    this.Roles.forEach(rol => {
      if (rol.modulos && Array.isArray(rol.modulos)) {
        totalModulos += rol.modulos.length;
      }
    });
    return totalModulos;
  }

  // Método para actualizar toda la página cuando se vuelva a entrar a la vista
  ionViewWillEnter() {
    this.cargarDatos();
  }

  obtenerFechaModificacion(rol: any): string {
    // En una implementación real, deberías obtener esta fecha de la base de datos
    // Por ahora usamos la fecha actual para que sea más realista
    return new Date().toLocaleDateString('es-ES');
  }

  filtrarRoles() {
    this.rolesFiltrados = this.Roles.filter(rol => {
      // Filtrar por término de búsqueda
      const cumpleBusqueda = !this.searchTerm ||
        rol.nombre_rol.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtrar por estado
      const cumpleEstado = this.filtroEstado === 'todos' ||
        rol.estado === (this.filtroEstado === 'true');

      return cumpleBusqueda && cumpleEstado;
    });
  }

  async cambiarEstadoRol(rol: any) {
    try {
      const nuevoEstado = !rol.estado;
      const mensaje = nuevoEstado
        ? `¿Estás seguro de que deseas activar el rol "${rol.nombre_rol}"?`
        : `¿Estás seguro de que deseas desactivar el rol "${rol.nombre_rol}"?`;

      const alert = await this.alertController.create({
        header: nuevoEstado ? 'Activar Rol' : 'Desactivar Rol',
        message: mensaje,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Confirmar',
            role: 'confirm',
            handler: async () => {
              const { error } = await supabase
                .from('Rol')
                .update({ estado: nuevoEstado })
                .eq('Id_Rol', rol.Id_Rol);

              if (error) {
                console.error('Error al cambiar el estado del rol:', error.message);
                this.presentToast('Error al actualizar el estado del rol', 'danger');
                return;
              }

              // Actualizar el estado en la lista local
              rol.estado = nuevoEstado;
              this.calcularRolesActivos();
              this.presentToast(
                `El rol "${rol.nombre_rol}" ha sido ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
                'success'
              );
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.error('Error al cambiar estado del rol:', error);
      this.presentToast('Ha ocurrido un error inesperado', 'danger');
    }
  }

  async confirmarEliminar(rol: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar el rol "${rol.nombre_rol}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarRol(rol);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarRol(rol: any) {
    try {
      const { error } = await supabase
        .from('Rol')
        .delete()
        .eq('Id_Rol', rol.Id_Rol);

      if (error) {
        if (error.code === '23503') { // Error de clave foránea
          this.presentToast('No se puede eliminar este rol porque está asignado a usuarios.', 'danger');
        } else {
          this.presentToast('Error al eliminar el rol: ' + error.message, 'danger');
        }
        return;
      }

      // Actualizar lista local
      this.Roles = this.Roles.filter(r => r.Id_Rol !== rol.Id_Rol);
      this.filtrarRoles();
      this.calcularRolesActivos();
      this.presentToast(`Rol "${rol.nombre_rol}" eliminado con éxito`, 'success');
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      this.presentToast('Ha ocurrido un error inesperado', 'danger');
    }
  }

  async mostrarTodosLosModulos(rol: any) {
    if (!rol.modulos || rol.modulos.length === 0) {
      return;
    }

    const modulosLista = rol.modulos.map((modulo: string) => `• ${modulo}`).join('<br>');

    const alert = await this.alertController.create({
      header: `Módulos de ${rol.nombre_rol}`,
      message: `<div class="modulos-lista">${modulosLista}</div>`,
      buttons: ['Cerrar']
    });

    await alert.present();
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

  iraCrearRol() {
    this.router.navigate(['/gestionar-roles/crear']);
  }

  iraEditarRol(IdRol: string) {
    this.router.navigate(['/gestionar-roles/editar', IdRol]);
  }
}
