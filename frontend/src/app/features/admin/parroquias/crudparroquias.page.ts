import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { Parroquia } from 'src/app/shared/models/parroquia.model';
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
  close
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
  cantones: any[] = [];

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
      close
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
        this.obtenerCantones(),
        this.obtenerParroquias()
      ]);
      this.asociarCantones();
      this.filtrarParroquias();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.presentToast('Error al cargar los datos iniciales', 'danger');
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  async obtenerParroquias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('parroquias'));
      this.parroquias = data || [];
      this.calcularEstadisticas();
    } catch (error) {
      console.error('Error al obtener parroquias:', error);
      this.presentToast('Error al cargar parroquias. (API)', 'danger');
    }
  }

  async obtenerCantones() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cantones'));
      this.cantones = data || [];
    } catch (error) {
      console.error('Error al obtener cantones:', error);
    }
  }

  asociarCantones() {
    this.parroquias = this.parroquias.map(parroquia => {
      // Logic for matching canton name might depend on the property name. 
      // Existing code used codigo_canton. I'll stick to it or id if available.
      const canton = this.cantones.find(c => c.codigo_canton === parroquia.codigo_canton || c.id === parroquia.Id_Canton);
      return {
        ...parroquia,
        nombre_canton: canton ? (canton.nombre_canton || canton.nombre) : 'Cantón no encontrado'
      };
    });
  }

  calcularEstadisticas() {
    this.parroquiasActivas = this.parroquias.filter(p => p.estado).length;
    this.cd.markForCheck();
  }

  filtrarParroquias() {
    const term = this.searchTerm.trim().toLowerCase();

    this.parroquiasFiltradas = this.parroquias.filter(parroquia => {
      // Filtrar por término de búsqueda
      const matchesSearchTerm = term === '' ||
        (parroquia.nombre_parroquia || '').toLowerCase().includes(term) ||
        (parroquia.codigo_parroquia || '').toString().toLowerCase().includes(term);

      // Filtrar por cantón
      const matchesCanton = this.filtroCanton === 'todos' ||
        parroquia.codigo_canton === this.filtroCanton ||
        parroquia.Id_Canton?.toString() === this.filtroCanton;

      // Filtrar por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        parroquia.estado.toString() === this.filtroEstado;

      return matchesSearchTerm && matchesCanton && matchesEstado;
    });

    this.cd.markForCheck();
  }

  crearParroquia() {
    this.router.navigate(['/gestionar-parroquias/crear']);
  }

  editarParroquia(idparroquia: any) {
    this.router.navigate(['/gestionar-parroquias/editar', idparroquia]);
  }

  async cambiarEstado(parroquia: Parroquia) {
    const nuevoEstado = !parroquia.estado;

    try {
      // Using codigo_parroquia or id based on what the API expects
      const idToUpdate = parroquia.codigo_parroquia || parroquia.Id_Parroquia;
      await firstValueFrom(this.catalogoService.updateItem('parroquias', idToUpdate, { estado: nuevoEstado }));

      parroquia.estado = nuevoEstado;
      this.calcularEstadisticas();
      this.filtrarParroquias();
      this.presentToast(
        `Parroquia "${parroquia.nombre_parroquia}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`,
        'success'
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.presentToast('Error al actualizar el estado', 'danger');
    } finally {
      this.cd.markForCheck();
    }
  }

  async confirmarEliminar(parroquia: Parroquia) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar la parroquia "${parroquia.nombre_parroquia}"?`,
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
      const idToDelete = parroquia.codigo_parroquia || parroquia.Id_Parroquia;
      await firstValueFrom(this.catalogoService.deleteItem('parroquias', idToDelete));

      this.parroquias = this.parroquias.filter(p => (p.codigo_parroquia || p.Id_Parroquia) !== idToDelete);
      this.calcularEstadisticas();
      this.filtrarParroquias();
      this.presentToast('Parroquia eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar parroquia:', error);
      this.presentToast('Error al eliminar la parroquia', 'danger');
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
