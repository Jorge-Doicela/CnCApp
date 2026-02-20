import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudparroquias',
  templateUrl: './crudparroquias.page.html',
  styleUrls: ['./crudparroquias.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CrudparroquiasPage implements OnInit {

  parroquias: any[] = [];
  parroquiasFiltradas: any[] = [];
  cantones: any[] = [];
  cargando: boolean = true;
  searchTerm: string = '';
  filtroCanton: string = 'todos';
  filtroEstado: string = 'todos';
  parroquiasActivas: number = 0;

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
    await this.obtenerCantones();
    await this.obtenerParroquias();
    this.cargando = false;
  }

  async obtenerParroquias() {
    const loading = await this.loadingController.create({
      message: 'Obteniendo parroquias...',
      spinner: 'crescent'
    });
    await loading.present();
    try {
      const parroquias = await firstValueFrom(this.catalogoService.getItems('parroquias'));
      this.parroquias = parroquias || [];
      this.asociarCantones();
      this.calcularEstadisticas();
      this.filtrarParroquias();
    } catch (error) {
      this.presentToast('Error al obtener parroquias', 'danger');
      console.error(error);
    } finally {
      loading.dismiss();
    }
  }

  async obtenerCantones() {
    try {
      const cantones = await firstValueFrom(this.catalogoService.getItems('cantones'));
      this.cantones = cantones || [];
    } catch (error) {
      console.error('Error al obtener cantones:', error);
    }
  }

  asociarCantones() {
    this.parroquias = this.parroquias.map(parroquia => {
      const canton = this.cantones.find(c => c.codigo_canton === parroquia.codigo_canton);
      return {
        ...parroquia,
        nombre_canton: canton ? canton.nombre_canton : 'Cantón no encontrado'
      };
    });
  }

  calcularEstadisticas() {
    this.parroquiasActivas = this.parroquias.filter(p => p.estado === true).length;
  }

  filtrarParroquias() {
    this.parroquiasFiltradas = this.parroquias.filter(parroquia => {
      // Filtrar por término de búsqueda
      const matchesSearchTerm = this.searchTerm.trim() === '' ||
        parroquia.nombre_parroquia.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        parroquia.codigo_parroquia.toString().includes(this.searchTerm.toLowerCase());

      // Filtrar por cantón
      const matchesCanton = this.filtroCanton === 'todos' ||
        parroquia.codigo_canton === this.filtroCanton;

      // Filtrar por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        parroquia.estado.toString() === this.filtroEstado;

      return matchesSearchTerm && matchesCanton && matchesEstado;
    });
  }

  crearParroquia() {
    this.router.navigate(['/gestionar-parroquias/crear']);
  }

  editarParroquia(idparroquia: any) {
    this.router.navigate(['/gestionar-parroquias/editar', idparroquia]);
  }

  async cambiarEstado(parroquia: any) {
    const loading = await this.loadingController.create({
      message: 'Actualizando estado...',
      spinner: 'crescent'
    });
    await loading.present();

    const nuevoEstado = !parroquia.estado;
    this.catalogoService.updateItem('parroquias', parroquia.codigo_parroquia, { estado: nuevoEstado }).subscribe({
      next: () => {
        loading.dismiss();
        // Actualizar el objeto local
        parroquia.estado = nuevoEstado;
        this.calcularEstadisticas();
        this.presentToast(
          `Parroquia "${parroquia.nombre_parroquia}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`,
          'success'
        );
      },
      error: (error) => {
        loading.dismiss();
        this.presentToast('Error al cambiar estado: ' + error.message, 'danger');
      }
    });
  }

  async confirmarEliminar(parroquia: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar la parroquia "${parroquia.nombre_parroquia}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.eliminarParroquia(parroquia.codigo_parroquia);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarParroquia(codigo_parroquia: string) {
    const loading = await this.loadingController.create({
      message: 'Eliminando parroquia...',
      spinner: 'crescent'
    });
    await loading.present();

    this.catalogoService.deleteItem('parroquias', codigo_parroquia).subscribe({
      next: () => {
        loading.dismiss();
        this.presentToast('Parroquia eliminada correctamente', 'success');
        this.obtenerParroquias();
      },
      error: (error) => {
        loading.dismiss();
        this.presentToast('Error al eliminar parroquia: ' + error.message, 'danger');
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
