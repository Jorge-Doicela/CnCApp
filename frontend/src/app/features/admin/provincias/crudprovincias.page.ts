import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { Provincia } from 'src/app/shared/models/provincia.model';
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
  swapVerticalOutline
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudprovincias',
  templateUrl: './crudprovincias.page.html',
  styleUrls: ['./crudprovincias.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudprovinciasPage implements OnInit {
  // Variables para provincias
  provincias: Provincia[] = [];
  filteredProvincias: Provincia[] = [];

  // Variables para búsqueda y filtrado
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  cargando: boolean = false;

  // Variables para estadísticas
  totalProvincias: number = 0;
  provinciasActivas: number = 0;
  provinciasInactivas: number = 0;

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
      swapVerticalOutline
    });
  }

  ngOnInit() {
    this.obtenerProvincias();
  }

  async obtenerProvincias() {
    this.cargando = true;
    this.cd.markForCheck();

    try {
      const data = await firstValueFrom(this.catalogoService.getItems('provincias'));
      this.provincias = data || [];

      // Sort manually with safety checks
      this.provincias.sort((a, b) => {
        const nameA = a.Nombre_Provincia || '';
        const nameB = b.Nombre_Provincia || '';
        return nameA.localeCompare(nameB);
      });

      this.filteredProvincias = [...this.provincias];
      this.calcularEstadisticas();
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      this.presentToast('Error al cargar provincias. (API)', 'danger');
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  buscarProvincia() {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredProvincias = this.provincias.filter(provincia => {
      // Filtrar por término de búsqueda
      const matchesSearchTerm = term === '' ||
        (provincia.Nombre_Provincia || '').toLowerCase().includes(term) ||
        (provincia.Codigo_Provincia || '').toLowerCase().includes(term);

      // Filtrar por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'activo' && provincia.Estado) ||
        (this.filtroEstado === 'inactivo' && !provincia.Estado);

      return matchesSearchTerm && matchesEstado;
    });

    if (this.filteredProvincias.length === 0 && term !== '') {
      this.presentToast('No se encontraron provincias con los criterios de búsqueda', 'warning');
    }

    this.cd.markForCheck();
  }

  calcularEstadisticas() {
    this.totalProvincias = this.provincias.length;
    this.provinciasActivas = this.provincias.filter(p => p.Estado).length;
    this.provinciasInactivas = this.totalProvincias - this.provinciasActivas;
    this.cd.markForCheck();
  }

  crearProvincia() {
    this.router.navigate(['/gestionar-provincias/crear']);
  }

  editarProvincia(id: number) {
    this.router.navigate(['/gestionar-provincias/editar', id]);
  }

  async cambiarEstado(provincia: Provincia) {
    const nuevoEstado = !provincia.Estado;

    try {
      await firstValueFrom(this.catalogoService.updateItem('provincias', provincia.IdProvincia, { Estado: nuevoEstado }));

      // Actualizar el objeto local
      provincia.Estado = nuevoEstado;
      this.calcularEstadisticas();
      this.presentToast(
        `Provincia "${provincia.Nombre_Provincia}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`,
        'success'
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.presentToast('Error al cambiar el estado de la provincia', 'danger');
    } finally {
      this.cd.markForCheck();
    }
  }

  async confirmarEliminar(provincia: Provincia) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar la provincia "${provincia.Nombre_Provincia}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarProvincia(provincia);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarProvincia(provincia: Provincia) {
    try {
      await firstValueFrom(this.catalogoService.deleteItem('provincias', provincia.IdProvincia));

      // Actualizar listas locales
      this.provincias = this.provincias.filter(p => p.IdProvincia !== provincia.IdProvincia);
      this.filteredProvincias = this.filteredProvincias.filter(p => p.IdProvincia !== provincia.IdProvincia);
      this.calcularEstadisticas();
      this.presentToast(`Provincia "${provincia.Nombre_Provincia}" eliminada correctamente`, 'success');
    } catch (error) {
      console.error('Error al eliminar provincia:', error);
      this.presentToast('Error al eliminar la provincia. Puede que tenga registros relacionados.', 'danger');
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
