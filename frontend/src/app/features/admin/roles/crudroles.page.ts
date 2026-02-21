import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudroles',
  templateUrl: './crudroles.page.html',
  styleUrls: ['./crudroles.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CRUDRolesPage implements OnInit {
  Roles: any[] = [];
  rolesFiltrados: any[] = [];
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  cargando: boolean = true;
  rolesActivos: number = 0;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

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
      const data = await firstValueFrom(this.catalogoService.getItems('rol'));
      this.Roles = data ?? [];
      this.rolesFiltrados = [...this.Roles];
      this.calcularRolesActivos();
      console.log('Roles cargados:', this.Roles);
    } catch (error) {
      console.error('Error al obtener los roles:', error);
      this.presentToast('Error al cargar los roles (API)', 'danger');
      this.Roles = [];
      this.rolesFiltrados = [];
    } finally {
      this.cd.markForCheck();
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
        rol.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtrar por estado
      const cumpleEstado = this.filtroEstado === 'todos' ||
        rol.estado === (this.filtroEstado === 'true');

      return cumpleBusqueda && cumpleEstado;
    });
  }

  async cambiarEstadoRol(rol: any) {
    const nuevoEstado = !rol.estado;
    const mensaje = nuevoEstado
      ? `¿Estás seguro de que deseas activar el rol "${rol.nombre}"?`
      : `¿Estás seguro de que deseas desactivar el rol "${rol.nombre}"?`;

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
            try {
              await firstValueFrom(this.catalogoService.updateItem('rol', rol.id, { estado: nuevoEstado }));

              // Actualizar el estado en la lista local
              rol.estado = nuevoEstado;
              this.calcularRolesActivos();
              this.cd.markForCheck();
              this.presentToast(
                `El rol "${rol.nombre}" ha sido ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
                'success'
              );
            } catch (error) {
              console.error('Error al cambiar el estado del rol:', error);
              this.presentToast('Error al actualizar el estado del rol', 'danger');
              this.cd.markForCheck();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarEliminar(rol: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar el rol "${rol.nombre}"?`,
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
      await firstValueFrom(this.catalogoService.deleteItem('rol', rol.id));

      // Actualizar lista local
      this.Roles = this.Roles.filter(r => r.id !== rol.id);
      this.filtrarRoles();
      this.calcularRolesActivos();
      this.cd.markForCheck();
      this.presentToast(`Rol "${rol.nombre}" eliminado con éxito`, 'success');
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      this.presentToast('Error al eliminar el rol. Puede estar en uso.', 'danger');
      this.cd.markForCheck();
    }
  }

  async mostrarTodosLosModulos(rol: any) {
    if (!rol.modulos || rol.modulos.length === 0) {
      return;
    }

    const modulosLista = rol.modulos.map((modulo: string) => `• ${modulo}`).join('<br>');

    const alert = await this.alertController.create({
      header: `Módulos de ${rol.nombre}`,
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
