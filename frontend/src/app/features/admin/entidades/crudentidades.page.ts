import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  search,
  funnelOutline,
  businessOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  alertCircleOutline,
  keyOutline,
  createOutline,
  trashOutline,
  swapVerticalOutline,
  addCircleOutline,
  close
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudentidades',
  templateUrl: './crudentidades.page.html',
  styleUrls: ['./crudentidades.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudentidadesPage implements OnInit {
  entidades: any[] = [];
  entidadesFiltradas: any[] = [];
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenPor: string = 'nombre';
  isLoading: boolean = false;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    addIcons({
      searchOutline,
      search,
      funnelOutline,
      businessOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      alertCircleOutline,
      keyOutline,
      createOutline,
      trashOutline,
      swapVerticalOutline,
      addCircleOutline,
      close
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.isLoading = true;
    this.cd.markForCheck();
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('entidades'));
      this.entidades = data ?? [];
      this.filtrarEntidades();
      console.log('Entidades cargadas:', this.entidades);
    } catch (error) {
      console.error('Error al obtener las entidades:', error);
      this.presentToast('Error al cargar entidades (API)', 'danger');
    } finally {
      this.isLoading = false;
      this.cd.markForCheck();
    }
  }

  filtrarEntidades() {
    const term = this.searchTerm.toLowerCase().trim();
    this.entidadesFiltradas = this.entidades.filter(entidad => {
      const nombre = entidad.nombre?.toLowerCase() || '';
      const matchesSearch = term === '' || nombre.includes(term);

      const matchesEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === '1' ? entidad.estado : !entidad.estado);

      return matchesSearch && matchesEstado;
    });

    this.ordenarEntidades();
    this.cd.markForCheck();
  }

  ordenarEntidades() {
    switch (this.ordenPor) {
      case 'nombre':
        this.entidadesFiltradas.sort((a, b) =>
          (a.nombre || '').localeCompare(b.nombre || ''));
        break;
      case 'estado':
        this.entidadesFiltradas.sort((a, b) => (Number(b.estado) - Number(a.estado)));
        break;
      case 'id':
        this.entidadesFiltradas.sort((a, b) => a.id - b.id);
        break;
    }
    this.cd.markForCheck();
  }

  getValidEntidadesCount(): number {
    return this.entidades.filter(e => e.estado).length;
  }

  getInvalidEntidadesCount(): number {
    return this.entidades.filter(e => !e.estado).length;
  }

  iraCrearEntidad() {
    this.router.navigate(['/gestionar-entidades/crear']);
  }

  iraEditarEntidad(id: string) {
    this.router.navigate(['/gestionar-entidades/editar', id]);
  }

  async cambiarEstado(entidad: any) {
    const newState = !entidad.estado;
    const stateText = newState ? 'activar' : 'desactivar';

    const alert = await this.alertController.create({
      header: `Confirmar cambio de estado`,
      message: `¿Estás seguro que deseas ${stateText} la entidad ${entidad.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          handler: async () => {
            try {
              await firstValueFrom(this.catalogoService.updateItem('entidades', entidad.id, { estado: newState }));
              entidad.estado = newState;
              this.filtrarEntidades();
              this.presentToast(`La entidad ha sido ${newState ? 'activada' : 'desactivada'} correctamente`, 'success');
            } catch (error: any) {
              this.presentToast(`Error al ${stateText} la entidad: ${error.message}`, 'danger');
            } finally {
              this.cd.markForCheck();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarEliminar(entidad: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro que deseas eliminar la entidad ${entidad.nombre}? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarEntidad(entidad.id);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarEntidad(id: string) {
    try {
      await firstValueFrom(this.catalogoService.deleteItem('entidades', id));
      this.presentToast('Entidad eliminada correctamente', 'success');
      await this.cargarDatos();
    } catch (error) {
      console.error('Error al eliminar la entidad:', error);
      this.presentToast('Error al eliminar la entidad.', 'danger');
    } finally {
      this.cd.markForCheck();
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [{ icon: 'close', role: 'cancel' }]
    });

    await toast.present();
  }
}
