import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personAddOutline, searchOutline, search, idCardOutline,
  businessOutline, shieldOutline, shieldCheckmark, fingerPrintOutline,
  callOutline, people, peopleOutline, person, createOutline, trashOutline, mailOutline, add
} from 'ionicons/icons';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { Usuario } from '../../../core/models/usuario.interface';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { TipoParticipanteEnum } from 'src/app/shared/constants/enums';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudusuarios',
  templateUrl: './crudusuarios.page.html',
  styleUrls: ['./crudusuarios.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CRUDUsuariosPage implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  searchTerm: string = '';
  filterRol: string = 'todos';
  filterTipo: string = 'todos';
  roles: any[] = [];
  cargando: boolean = true;

  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private catalogoService = inject(CatalogoService);

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
      'shield-checkmark': shieldCheckmark,
      'finger-print-outline': fingerPrintOutline,
      'call-outline': callOutline,
      'people': people,
      'people-outline': peopleOutline,
      'person': person,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'add': add
    });
  }

  ngOnInit() {
    this.RecuperarUsuarios();
    this.RecuperarRoles();
  }

  getTipoParticipante(tipo: number | string): string {
    const t = Number(tipo);
    const labels: { [key: number]: string } = {
      [TipoParticipanteEnum.CIUDADANO]: 'Ciudadano',
      [TipoParticipanteEnum.AUTORIDAD]: 'Autoridad',
      [TipoParticipanteEnum.FUNCIONARIO_GAD]: 'Funcionario GAD',
      [TipoParticipanteEnum.INSTITUCION]: 'Institución'
    };
    return labels[t] || "Desconocido";
  }

  getAdmins(): number {
    return this.usuarios.filter((u: any) => u.rol?.nombre === 'Administrador').length;
  }

  getTiposUnicos(): number {
    const tipos = new Set(this.usuarios.map((u: any) => u.tipoParticipanteId || u.tipoParticipante?.id).filter(id => !!id));
    return tipos.size;
  }

  async RecuperarRoles() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('rol'));
      this.roles = data ?? [];
    } catch (error) {
      console.error('Error al obtener los roles:', error);
    } finally {
      this.cd.markForCheck();
    }
  }

  async RecuperarUsuarios() {
    this.cargando = true;
    this.cd.markForCheck();
    try {
      const data = await firstValueFrom(this.usuarioService.getUsuarios());
      console.log('Usuarios cargados:', data);
      this.usuarios = data || [];
      this.filteredUsuarios = [...this.usuarios];
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      this.presentToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
      this.usuarios = [];
      this.filteredUsuarios = [];
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  iraCrearUsuario() {
    this.router.navigate(['/gestionar-usuarios/crear']);
  }

  iraEditarUsuario(id: number) {
    if (!id) return;
    this.router.navigate(['/gestionar-usuarios/editar', id]);
  }

  iraDetallesUsuario(id: number) {
    if (!id) return;
    this.router.navigate(['/gestionar-usuarios/detalles', id]);
  }

  filtrarUsuarios() {
    let results = [...this.usuarios];

    // Búsqueda por texto
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      results = results.filter((usuario: any) =>
        (usuario.nombre || '').toLowerCase().includes(term) ||
        (usuario.ci || '').toLowerCase().includes(term) ||
        (usuario.email || '').toLowerCase().includes(term) ||
        (usuario.rol?.nombre || '').toLowerCase().includes(term) ||
        (usuario.entidad?.nombre || '').toLowerCase().includes(term)
      );
    }

    // Filtro por Rol
    if (this.filterRol !== 'todos') {
      results = results.filter((u: any) => u.rol?.nombre === this.filterRol);
    }

    // Filtro por Tipo de Participante
    if (this.filterTipo !== 'todos') {
      results = results.filter((u: any) => {
        const tipoId = u.tipoParticipanteId || u.tipoParticipante?.id;
        return String(tipoId) === this.filterTipo;
      });
    }

    this.filteredUsuarios = results;
    this.cd.markForCheck();
  }

  async confirmarEliminar(usuario: any) {
    // Self-deletion guard
    const currentUserId = this.authService.currentUser()?.id;
    if (currentUserId === usuario.id) {
      this.presentToast('No puedes eliminar tu propia cuenta.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar al usuario <strong>${usuario.nombre}</strong>? Esta acción no se puede deshacer.`,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        }, {
          text: 'Eliminar',
          role: 'destructive',
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
      await firstValueFrom(this.usuarioService.deleteUsuario(idUsuario));

      loading.dismiss();
      // Actualizar la lista
      this.usuarios = this.usuarios.filter(u => u.id !== idUsuario);
      this.filteredUsuarios = this.filteredUsuarios.filter(u => u.id !== idUsuario);
      this.presentToast('Usuario eliminado correctamente', 'success');
      this.cd.markForCheck();
    } catch (error) {
      loading.dismiss();
      console.error('Error al eliminar usuario:', error);
      this.presentToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
      this.cd.markForCheck();
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
