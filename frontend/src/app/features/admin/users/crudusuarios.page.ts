import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personAddOutline, searchOutline, search, idCardOutline,
  businessOutline, shieldOutline, fingerPrintOutline,
  callOutline, peopleOutline, createOutline, trashOutline, mailOutline
} from 'ionicons/icons';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudusuarios',
  templateUrl: './crudusuarios.page.html',
  styleUrls: ['./crudusuarios.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class CRUDUsuariosPage implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  searchTerm: string = '';
  cargando: boolean = true;

  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  private cd = inject(ChangeDetectorRef);

  constructor() {
    // Registrar iconos
    addIcons({
      'mail-outline': mailOutline,
      'person-add-outline': personAddOutline,
      'search-outline': searchOutline,
      'search': search,
      'id-card-outline': idCardOutline,
      'business-outline': businessOutline,
      'shield-outline': shieldOutline,
      'finger-print-outline': fingerPrintOutline,
      'call-outline': callOutline,
      'people-outline': peopleOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    this.RecuperarUsuarios();
  }

  getTipoParticipante(tipo: number): string {
    const tipos = ["Ciudadano", "Autoridad", "Funcionario GAD", "Institución"];
    return tipos[tipo] || "Desconocido";
  }

  async RecuperarUsuarios() {
    this.cargando = true;
    try {
      const data = await firstValueFrom(this.usuarioService.getUsuarios());
      console.log('Usuarios cargados:', data);
      this.usuarios = data || [];
      this.filteredUsuarios = [...this.usuarios];
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      this.presentToast('Error al cargar la lista de usuarios', 'danger');
      this.usuarios = [];
      this.filteredUsuarios = [];
    } finally {
      this.cargando = false;
      this.cd.detectChanges();
    }
  }

  iraCrearUsuario() {
    this.router.navigate(['/gestionar-usuarios/crear']);
  }

  iraEditarUsuario(Id_Usuario: number) {
    if (!Id_Usuario) return;
    this.router.navigate(['/gestionar-usuarios/editar', Id_Usuario]);
  }

  iraDetallesUsuario(Id_Usuario: number) {
    if (!Id_Usuario) return;
    this.router.navigate(['/gestionar-usuarios/detalles', Id_Usuario]);
  }

  filtrarUsuarios() {
    if (!this.searchTerm.trim()) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsuarios = this.usuarios.filter((usuario: any) =>
      (usuario.nombre || '').toLowerCase().includes(term) ||
      (usuario.ci || '').toLowerCase().includes(term) ||
      (usuario.email || '').toLowerCase().includes(term)
    );
  }

  async confirmarEliminar(usuario: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar al usuario ${usuario.nombre}?`,
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
            this.eliminarUsuario(usuario.id);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarUsuario(idUsuario: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando usuario...',
    });
    await loading.present();

    try {
      this.usuarioService.deleteUsuario(idUsuario).subscribe({
        next: () => {
          loading.dismiss();
          // Actualizar la lista
          this.usuarios = this.usuarios.filter(u => u.id !== idUsuario);
          this.filteredUsuarios = this.filteredUsuarios.filter(u => u.id !== idUsuario);
          this.presentToast('Usuario eliminado correctamente', 'success');
        },
        error: (error) => {
          loading.dismiss();
          console.error('Error al eliminar usuario:', error);
          this.presentToast('No se pudo eliminar el usuario', 'danger');
        }
      });
    } catch (error) {
      loading.dismiss();
      console.error('Error inesperado:', error);
      this.presentToast('Error inesperado', 'danger');
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [{ text: 'Cerrar', role: 'cancel' }]
    });

    await toast.present();
  }
}
