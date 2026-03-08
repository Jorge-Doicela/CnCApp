import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { Parroquia } from 'src/app/shared/models/parroquia.model';
import { Canton } from 'src/app/shared/models/canton.model';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
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
  locationOutline,
  close,
  arrowBackOutline
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudparroquias',
  templateUrl: './crudparroquias.page.html',
  styleUrls: ['./crudparroquias.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudparroquiasPage implements OnInit {
  parroquias: Parroquia[] = [];
  parroquiasFiltradas: Parroquia[] = [];
  cantones: Canton[] = [];

  cargando: boolean = false;
  searchTerm: string = '';
  filtroCanton: string = 'todos';
  filtroEstado: string = 'todos';
  parroquiasActivas: number = 0;

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
      locationOutline,
      close,
      arrowBackOutline
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    this.cd.markForCheck();

    try {
      const [cantonesData, parroquiasData] = await Promise.all([
        firstValueFrom(this.catalogoService.getItems('cantones')),
        firstValueFrom(this.catalogoService.getItems('parroquias'))
      ]);

      this.cantones = cantonesData || [];
      this.parroquias = parroquiasData || [];

      this.filtrarParroquias();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.presentToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  calcularEstadisticas() {
    this.parroquiasActivas = this.parroquias.filter(p => p.estado).length;
    this.cd.markForCheck();
  }

  filtrarParroquias() {
    const term = this.searchTerm.trim().toLowerCase();

    this.parroquiasFiltradas = this.parroquias.filter(parroquia => {
      // Find canton name for search
      const canton = this.cantones.find(c => c.id === parroquia.cantonId);
      const nombreCanton = (canton?.nombre || '').toLowerCase();

      // Filtrar por término de búsqueda
      const matchesSearchTerm = term === '' ||
        (parroquia.nombre || '').toLowerCase().includes(term) ||
        nombreCanton.includes(term);

      // Filtrar por cantón
      const matchesCanton = this.filtroCanton === 'todos' ||
        parroquia.cantonId?.toString() === this.filtroCanton;

      // Filtrar por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'true' && parroquia.estado) ||
        (this.filtroEstado === 'false' && !parroquia.estado);

      return matchesSearchTerm && matchesCanton && matchesEstado;
    });

    this.calcularEstadisticas();
    this.cd.markForCheck();
  }

  getCantonNombre(cantonId: number): string {
    const canton = this.cantones.find(c => c.id === cantonId);
    return canton ? canton.nombre : 'No asignado';
  }

  crearParroquia() {
    this.router.navigate(['/gestionar-parroquias/crear']);
  }

  editarParroquia(id: number) {
    this.router.navigate(['/gestionar-parroquias/editar', id]);
  }

  async cambiarEstado(parroquia: Parroquia) {
    const nuevoEstado = !parroquia.estado;

    try {
      await firstValueFrom(this.catalogoService.updateItem('parroquias', parroquia.id, { estado: nuevoEstado }));

      parroquia.estado = nuevoEstado;
      this.filtrarParroquias();
      this.presentToast(
        `Parroquia "${parroquia.nombre}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`,
        'success'
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.presentToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    } finally {
      this.cd.markForCheck();
    }
  }

  async confirmarEliminar(parroquia: Parroquia) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar la parroquia "${parroquia.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarParroquia(parroquia);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarParroquia(parroquia: Parroquia) {
    try {
      await firstValueFrom(this.catalogoService.deleteItem('parroquias', parroquia.id));

      this.parroquias = this.parroquias.filter(p => p.id !== parroquia.id);
      this.filtrarParroquias();
      this.presentToast(`Parroquia "${parroquia.nombre}" eliminada correctamente`, 'success');
    } catch (error) {
      console.error('Error al eliminar parroquia:', error);
      this.presentToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
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
