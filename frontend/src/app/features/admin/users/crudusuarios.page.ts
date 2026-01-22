import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';

@Component({
  selector: 'app-crudusuarios',
  templateUrl: './crudusuarios.page.html',
  styleUrls: ['./crudusuarios.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CRUDUsuariosPage implements OnInit {
  usuarios: any[] = [];
  filteredUsuarios: any[] = [];
  searchTerm: string = '';
  cargando: boolean = true;

  private usuarioService = inject(UsuarioService);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.RecuperarUsuarios();
  }

  getTipoParticipante(tipo: number): string {
    const tipos = ["Ciudadano", "Autoridad", "Funcionario GAD", "Institución"];
    return tipos[tipo] ?? "Desconocido";
  }

  async RecuperarUsuarios() {
    this.cargando = true;
    try {
      this.usuarioService.getUsuarios().subscribe({
        next: (data) => {
          this.usuarios = data?.map((usuario: any) => ({
            ...usuario,
            Nombre_Rol: usuario.Rol_Usuario?.nombre_rol ?? 'Rol no asignado',
            Entidad_Usario: usuario.Entidad_Usuario?.Nombre_Entidad ?? 'Entidad no asignada',
          })) ?? [];

          this.filteredUsuarios = [...this.usuarios];
          this.cargando = false;

          if (this.usuarios.length > 0) {
            this.presentToast(`Se cargaron ${this.usuarios.length} usuarios correctamente`, 'success');
          }
        },
        error: (error) => {
          console.error('Error al obtener los usuarios:', error);
          this.presentToast('Error al cargar los usuarios (API no implementada)', 'warning');
          this.cargando = false;
          // Fallback or empty state
          this.usuarios = [];
          this.filteredUsuarios = [];
        }
      });

    } catch (error) {
      console.error('Error inesperado:', error);
      this.presentToast('Error inesperado al cargar usuarios', 'danger');
      this.cargando = false;
    }
  }

  iraCrearUsuario() {
    this.router.navigate(['/gestionar-usuarios/crear']);
  }

  iraEditarUsuario(Id_Usuario: number) {
    this.router.navigate(['/gestionar-usuarios/editar', Id_Usuario]);
  }

  filtrarUsuarios() {
    if (!this.searchTerm.trim()) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsuarios = this.usuarios.filter((usuario: any) =>
      (usuario.Nombre_Usuario || '').toLowerCase().includes(term) ||
      (usuario.CI_Usuario || '').toLowerCase().includes(term)
    );

    this.presentToast(`Se encontraron ${this.filteredUsuarios.length} resultados`, 'primary');
  }

  async confirmarEliminar(usuario: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar al usuario ${usuario.Nombre_Usuario}?`,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        }, {
          text: 'Eliminar',
          cssClass: 'confirm-button',
          handler: () => {
            this.eliminarUsuario(usuario.Id_Usuario);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarUsuario(idUsuario: number) {
    try {
      this.usuarioService.deleteUsuario(idUsuario).subscribe({
        next: () => {
          // Actualizar la lista de usuarios
          this.usuarios = this.usuarios.filter(u => u.Id_Usuario !== idUsuario);
          this.filteredUsuarios = this.filteredUsuarios.filter(u => u.Id_Usuario !== idUsuario);
          this.presentToast('Usuario eliminado correctamente', 'success');
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          this.presentToast('Error al eliminar el usuario (API no implementada)', 'warning');
        }
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      this.presentToast('Error inesperado al eliminar usuario', 'danger');
    }
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
}
