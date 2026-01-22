import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';

@Component({
  selector: 'app-crudentidades',
  templateUrl: './crudentidades.page.html',
  styleUrls: ['./crudentidades.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CrudentidadesPage implements OnInit {
  Entidades: any[] = [];
  entidadesFiltradas: any[] = [];
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenPor: string = 'nombre';
  isLoading: boolean = false;

  private catalogoService = inject(CatalogoService);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.RecuperarEntidades();
  }

  ionViewWillEnter() {
    // Actualizar entidades cuando se vuelva a esta página
    this.RecuperarEntidades();
  }

  async RecuperarEntidades() {
    this.isLoading = true;
    this.catalogoService.getItems('entidades').subscribe({
      next: (data) => {
        this.Entidades = data ?? [];
        this.entidadesFiltradas = [...this.Entidades];
        this.ordenarEntidades();
        console.log('Entidades cargadas:', this.Entidades);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener las entidades:', error);
        this.presentToast('Error al cargar entidades (API)', 'danger');
        this.isLoading = false;
      }
    });
  }

  filtrarEntidades() {
    this.entidadesFiltradas = this.Entidades.filter(entidad => {
      // Filtro por término de búsqueda
      const matchesSearch = !this.searchTerm ||
        entidad.Nombre_Entidad.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        entidad.Estado_Entidad.toString() === this.filtroEstado;

      return matchesSearch && matchesEstado;
    });

    this.ordenarEntidades();
  }

  ordenarEntidades() {
    switch (this.ordenPor) {
      case 'nombre':
        this.entidadesFiltradas.sort((a, b) =>
          a.Nombre_Entidad.localeCompare(b.Nombre_Entidad));
        break;
      case 'estado':
        this.entidadesFiltradas.sort((a, b) => b.Estado_Entidad - a.Estado_Entidad);
        break;
      case 'id':
        this.entidadesFiltradas.sort((a, b) => a.Id_Entidad - b.Id_Entidad);
        break;
    }
  }

  getValidEntidades(): number {
    return this.Entidades.filter(e => e.Estado_Entidad === 1).length;
  }

  getInvalidEntidades(): number {
    return this.Entidades.filter(e => e.Estado_Entidad === 0).length;
  }

  iraCrearEntidad() {
    this.router.navigate(['/gestionar-entidades/crear']);
  }

  iraEditarEntidad(IdEntidad: string) {
    this.router.navigate(['/gestionar-entidades/editar', IdEntidad]);
  }

  async cambiarEstado(entidad: any) {
    const newState = entidad.Estado_Entidad === 1 ? 0 : 1;
    const stateText = newState === 1 ? 'activar' : 'desactivar';

    const alert = await this.alertController.create({
      header: `Confirmar cambio de estado`,
      message: `¿Estás seguro que deseas ${stateText} la entidad ${entidad.Nombre_Entidad}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          handler: () => {
            this.catalogoService.updateItem('entidades', entidad.Id_Entidad, { Estado_Entidad: newState }).subscribe({
              next: () => {
                // Actualizar el estado en el arreglo local
                entidad.Estado_Entidad = newState;
                this.presentToast(`La entidad ha sido ${newState === 1 ? 'activada' : 'desactivada'} correctamente`, 'success');
              },
              error: (error) => {
                this.presentToast(`Error al ${stateText} la entidad: ${error.message}`, 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarEliminar(entidad: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro que deseas eliminar la entidad ${entidad.Nombre_Entidad}? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.eliminarEntidad(entidad.Id_Entidad);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarEntidad(id: string) {
    // Deletion of associated images should be handled by the backend
    this.catalogoService.deleteItem('entidades', id).subscribe({
      next: () => {
        this.presentToast('Entidad eliminada correctamente', 'success');
        // Actualizar la lista de entidades
        this.RecuperarEntidades();
      },
      error: (error) => {
        console.error('Error al eliminar la entidad:', error);
        this.presentToast('Error al eliminar la entidad. ', 'danger');
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
