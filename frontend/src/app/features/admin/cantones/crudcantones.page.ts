import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudcantones',
  templateUrl: './crudcantones.page.html',
  styleUrls: ['./crudcantones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CrudcantonesPage implements OnInit {

  cantones: any[] = [];
  cantonesFiltrados: any[] = [];
  provincias: any[] = [];
  cargando: boolean = true;
  searchTerm: string = '';
  filtroProvincia: string = 'todas';
  filtroEstado: string = 'todos';
  totalCantones: number = 0;
  cantonesActivos: number = 0;
  cantonesInactivos: number = 0;

  private catalogoService = inject(CatalogoService);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    // Load both matching parallel ideally, but sequential is fine
    await this.obtenerProvincias();
    await this.obtenerCantones();
    this.cargando = false;
  }

  async obtenerCantones() {
    const loading = await this.loadingController.create({
      message: 'Obteniendo cantones...',
      spinner: 'crescent'
    });
    await loading.present();
    try {
      const cantones = await firstValueFrom(this.catalogoService.getItems('cantones'));
      this.cantones = cantones || [];
      this.asociarProvincias();
      this.calcularEstadisticas();
      this.filtrarCantones();
    } catch (error: any) {
      this.presentToast('Error al obtener cantones', 'danger');
      console.error(error);
    } finally {
      loading.dismiss();
    }
  }

  async obtenerProvincias() {
    try {
      const provincias = await firstValueFrom(this.catalogoService.getItems('provincias'));
      this.provincias = provincias || [];
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      this.presentToast('Error al obtener provincias', 'danger');
    }
  }

  asociarProvincias() {
    this.cantones = this.cantones.map(canton => {
      const provincia = this.provincias.find(p => p.Codigo_Provincia === canton.codigo_provincia);
      return {
        ...canton,
        nombre_provincia: provincia ? provincia.Nombre_Provincia : 'Provincia no encontrada'
      };
    });
  }

  calcularEstadisticas() {
    this.totalCantones = this.cantones.length;
    this.cantonesActivos = this.cantones.filter(c => c.estado === true).length;
    this.cantonesInactivos = this.cantones.filter(c => c.estado === false).length;
  }

  filtrarCantones() {
    this.cantonesFiltrados = this.cantones.filter(canton => {
      // Filtrar por término de búsqueda
      const matchesSearchTerm = this.searchTerm.trim() === '' ||
        canton.nombre_canton.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        canton.codigo_canton.toString().includes(this.searchTerm.toLowerCase());

      // Filtrar por provincia
      const matchesProvincia = this.filtroProvincia === 'todas' ||
        canton.codigo_provincia === this.filtroProvincia;

      // Filtrar por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'activo' && canton.estado === true) ||
        (this.filtroEstado === 'inactivo' && canton.estado === false);

      return matchesSearchTerm && matchesProvincia && matchesEstado;
    });
  }

  crearCanton() {
    this.router.navigate(['/gestionar-cantones/crear']);
  }

  editarCanton(idCanton: any) {
    this.router.navigate(['/gestionar-cantones/editar', idCanton]);
  }

  async cambiarEstado(canton: any) {
    const loading = await this.loadingController.create({
      message: 'Actualizando estado...',
      spinner: 'crescent'
    });
    await loading.present();

    const nuevoEstado = !canton.estado;
    this.catalogoService.updateItem('cantones', canton.codigo_canton, { estado: nuevoEstado }).subscribe({
      next: () => {
        loading.dismiss();
        // Actualizar el objeto local
        canton.estado = nuevoEstado;
        this.calcularEstadisticas();
        this.presentToast(
          `Cantón "${canton.nombre_canton}" ahora está ${nuevoEstado ? 'activo' : 'inactivo'} `,
          'success'
        );
      },
      error: (error) => {
        loading.dismiss();
        this.presentToast('Error al cambiar estado: ' + error.message, 'danger');
      }
    });
  }

  async verDetallesCanton(canton: any) {
    const alert = await this.alertController.create({
      header: canton.nombre_canton,
      subHeader: `Código: ${canton.codigo_canton} `,
      message: `< div >
  <p><strong>Provincia: </strong> ${canton.nombre_provincia}</p >
    <p><strong>Estado: </strong> ${canton.estado ? 'Activo' : 'Inactivo'}</p >
      ${canton.notas ? `<p><strong>Notas:</strong> ${canton.notas}</p>` : ''}
</div>`,
      buttons: ['Cerrar'],
      cssClass: 'canton-details-alert'
    });

    await alert.present();
  }

  async confirmarEliminacion(canton: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar el cantón "${canton.nombre_canton}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.eliminarCanton(canton.codigo_canton);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarCanton(codigo_canton: string) {
    const loading = await this.loadingController.create({
      message: 'Eliminando cantón...',
      spinner: 'crescent'
    });
    await loading.present();

    this.catalogoService.deleteItem('cantones', codigo_canton).subscribe({
      next: () => {
        loading.dismiss();
        this.presentToast('Cantón eliminado correctamente', 'success');
        this.obtenerCantones(); // Reload list
      },
      error: (error) => {
        loading.dismiss();
        this.presentToast('Error al eliminar cantón: ' + error.message, 'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [
        {
          side: 'end',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
