import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { Canton } from 'src/app/shared/models/canton.model';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  search,
  filterOutline,
  mapOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  addCircleOutline,
  alertCircleOutline,
  keyOutline,
  informationCircleOutline,
  createOutline,
  trashOutline,
  swapVerticalOutline,
  locationOutline
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudcantones',
  templateUrl: './crudcantones.page.html',
  styleUrls: ['./crudcantones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudcantonesPage implements OnInit {
  cantones: Canton[] = [];
  cantonesFiltrados: Canton[] = [];
  provincias: any[] = [];

  cargando: boolean = false;
  searchTerm: string = '';
  filtroProvincia: string = 'todas';
  filtroEstado: string = 'todos';

  totalCantones: number = 0;
  cantonesActivos: number = 0;
  cantonesInactivos: number = 0;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      searchOutline,
      search,
      filterOutline,
      mapOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      addCircleOutline,
      alertCircleOutline,
      keyOutline,
      informationCircleOutline,
      createOutline,
      trashOutline,
      swapVerticalOutline,
      locationOutline
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    this.cd.markForCheck();

    try {
      await Promise.all([
        this.obtenerProvincias(),
        this.obtenerCantones()
      ]);
      this.asociarProvincias();
      this.filtrarCantones();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.presentToast('Error al cargar datos iniciales', 'danger');
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  async obtenerCantones() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cantones'));
      this.cantones = data || [];
      this.calcularEstadisticas();
    } catch (error) {
      console.error('Error al obtener cantones:', error);
      this.presentToast('Error al obtener cantones de la API', 'danger');
    }
  }

  async obtenerProvincias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('provincias'));
      this.provincias = data || [];
    } catch (error) {
      console.error('Error al obtener provincias:', error);
    }
  }

  asociarProvincias() {
    this.cantones = this.cantones.map(canton => {
      // Normalizing property names for consistency
      const estadoNormalizado = canton.estado !== undefined ? canton.estado : canton.Estado;
      const nombreCantonNormalizado = canton.nombre_canton || canton.Nombre_Canton || '';
      const codigoCantonNormalizado = canton.codigo_canton || canton.id.toString();

      const provincia = this.provincias.find(p => p.Codigo_Provincia === canton.codigo_provincia || p.id === canton.Id_Provincia);
      return {
        ...canton,
        estado: estadoNormalizado ?? true,
        nombre_canton: nombreCantonNormalizado,
        codigo_canton: codigoCantonNormalizado,
        nombre_provincia: provincia ? (provincia.Nombre_Provincia || provincia.nombre) : 'Provincia no encontrada'
      };
    });
  }

  calcularEstadisticas() {
    this.totalCantones = this.cantones.length;
    this.cantonesActivos = this.cantones.filter(c => c.estado).length;
    this.cantonesInactivos = this.totalCantones - this.cantonesActivos;
    this.cd.markForCheck();
  }

  filtrarCantones() {
    const term = this.searchTerm.trim().toLowerCase();

    this.cantonesFiltrados = this.cantones.filter(canton => {
      const matchesSearchTerm = term === '' ||
        (canton.nombre_canton || '').toLowerCase().includes(term) ||
        (canton.codigo_canton || '').toString().toLowerCase().includes(term);

      const matchesProvincia = this.filtroProvincia === 'todas' ||
        canton.codigo_provincia === this.filtroProvincia ||
        canton.Id_Provincia?.toString() === this.filtroProvincia;

      const matchesEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'activo' && canton.estado) ||
        (this.filtroEstado === 'inactivo' && !canton.estado);

      return matchesSearchTerm && matchesProvincia && matchesEstado;
    });

    this.cd.markForCheck();
  }

  crearCanton() {
    this.router.navigate(['/gestionar-cantones/crear']);
  }

  editarCanton(idCanton: any) {
    this.router.navigate(['/gestionar-cantones/editar', idCanton]);
  }

  async cambiarEstado(canton: Canton) {
    const nuevoEstado = !canton.estado;

    try {
      const idToUpdate = canton.id || canton.Id_Canton || canton.codigo_canton;
      await firstValueFrom(this.catalogoService.updateItem('cantones', idToUpdate, { estado: nuevoEstado }));

      canton.estado = nuevoEstado;
      this.calcularEstadisticas();
      this.filtrarCantones();
      this.presentToast(
        `Cantón "${canton.nombre_canton}" ahora está ${nuevoEstado ? 'activo' : 'inactivo'}`,
        'success'
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.presentToast('Error al actualizar el estado', 'danger');
    } finally {
      this.cd.markForCheck();
    }
  }

  async verDetallesCanton(canton: Canton) {
    const alert = await this.alertController.create({
      header: canton.nombre_canton,
      subHeader: `Código: ${canton.codigo_canton}`,
      message: `
        <div class="alert-details">
          <p><strong>Provincia:</strong> ${canton.nombre_provincia}</p>
          <p><strong>Estado:</strong> ${canton.estado ? 'Activo' : 'Inactivo'}</p>
          ${canton.notas ? `<p><strong>Notas:</strong> ${canton.notas}</p>` : ''}
        </div>
      `,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  async confirmarEliminacion(canton: Canton) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar el cantón "${canton.nombre_canton}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarCanton(canton);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarCanton(canton: Canton) {
    try {
      const idToDelete = canton.id || canton.Id_Canton || canton.codigo_canton;
      await firstValueFrom(this.catalogoService.deleteItem('cantones', idToDelete));

      this.cantones = this.cantones.filter(c => (c.id || c.Id_Canton || c.codigo_canton) !== idToDelete);
      this.calcularEstadisticas();
      this.filtrarCantones();
      this.presentToast('Cantón eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar cantón:', error);
      this.presentToast('Error al eliminar el cantón', 'danger');
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
