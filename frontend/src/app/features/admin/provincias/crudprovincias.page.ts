import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';

@Component({
  selector: 'app-crudprovincias',
  templateUrl: './crudprovincias.page.html',
  styleUrls: ['./crudprovincias.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CrudprovinciasPage implements OnInit {
  // Variables para provincias
  provincias: any[] = [];
  filteredProvincias: any[] = [];

  // Variables para búsqueda y filtrado
  searchTerm: string = '';
  filtroEstado: string = 'todos';

  // Variables para estadísticas
  totalProvincias: number = 0;
  provinciasActivas: number = 0;
  provinciasInactivas: number = 0;

  private catalogoService = inject(CatalogoService);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.obtenerProvincias();
  }

  obtenerProvincias() {
    this.catalogoService.getItems('provincias').subscribe({
      next: (data) => {
        this.provincias = data || [];
        // Sort manually since backend might not
        this.provincias.sort((a, b) => a.Nombre_Provincia.localeCompare(b.Nombre_Provincia));
        this.filteredProvincias = [...this.provincias];
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al obtener provincias:', error);
        this.presentToast('Error al cargar provincias. (API no implementada)', 'danger');
      }
    });
  }

  buscarProvincia() {
    this.filteredProvincias = this.provincias.filter(provincia => {
      // Filtrar por término de búsqueda
      const matchesSearchTerm = this.searchTerm.trim() === '' ||
        provincia.Nombre_Provincia.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        provincia.Codigo_Provincia.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtrar por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'activo' && provincia.Estado) ||
        (this.filtroEstado === 'inactivo' && !provincia.Estado);

      return matchesSearchTerm && matchesEstado;
    });

    if (this.filteredProvincias.length === 0 && this.searchTerm !== '') {
      this.presentToast('No se encontraron provincias con los criterios de búsqueda', 'warning');
    }
  }

  calcularEstadisticas() {
    this.totalProvincias = this.provincias.length;
    this.provinciasActivas = this.provincias.filter(p => p.Estado).length;
    this.provinciasInactivas = this.totalProvincias - this.provinciasActivas;
  }

  crearProvincia() {
    this.router.navigate(['/gestionar-provincias/crear']);
  }

  editarProvincia(id: number) {
    this.router.navigate(['/gestionar-provincias/editar', id]);
  }

  cambiarEstado(provincia: any) {
    const nuevoEstado = !provincia.Estado;
    // Assuming partial update is supported or we send full object. 
    // Usually status toggle is a specific patch or we update the whole item.
    // For now, let's assume we update the specific field if API supports it, or generic update.

    this.catalogoService.updateItem('provincias', provincia.IdProvincia, { Estado: nuevoEstado }).subscribe({
      next: () => {
        // Actualizar el objeto local
        provincia.Estado = nuevoEstado;
        this.calcularEstadisticas();
        this.presentToast(
          `Provincia "${provincia.Nombre_Provincia}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`,
          'success'
        );
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.presentToast('Error al cambiar el estado de la provincia', 'danger');
      }
    });
  }

  async confirmarEliminar(provincia: any) {
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

  eliminarProvincia(provincia: any) {
    this.catalogoService.deleteItem('provincias', provincia.IdProvincia).subscribe({
      next: () => {
        // Actualizar listas locales
        this.provincias = this.provincias.filter(p => p.IdProvincia !== provincia.IdProvincia);
        this.filteredProvincias = this.filteredProvincias.filter(p => p.IdProvincia !== provincia.IdProvincia);
        this.calcularEstadisticas();
        this.presentToast(`Provincia "${provincia.Nombre_Provincia}" eliminada correctamente`, 'success');
      },
      error: (error) => {
        console.error('Error al eliminar provincia:', error);
        this.presentToast('Error al eliminar la provincia. Puede que tenga registros relacionados.', 'danger');
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
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
