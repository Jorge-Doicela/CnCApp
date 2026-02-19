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
        entidad.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por estado
      // Backend returns boolean, select returns string '1'/'0' or 'todos'
      const matchesEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === '1' ? entidad.estado : !entidad.estado);

      return matchesSearch && matchesEstado;
    });

    this.ordenarEntidades();
  }

  ordenarEntidades() {
    switch (this.ordenPor) {
      case 'nombre':
        this.entidadesFiltradas.sort((a, b) =>
          a.nombre.localeCompare(b.nombre));
        break;
      case 'estado':
        this.entidadesFiltradas.sort((a, b) => (Number(b.estado) - Number(a.estado)));
        break;
      case 'id':
        this.entidadesFiltradas.sort((a, b) => a.id - b.id);
        break;
    }
  }

  getValidEntidades(): number {
    return this.Entidades.filter(e => e.estado).length;
  }

  getInvalidEntidades(): number {
    return this.Entidades.filter(e => !e.estado).length;
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
          handler: () => {
            this.catalogoService.updateItem('entidades', entidad.id, { estado: newState }).subscribe({
              next: () => {
                // Actualizar el estado en el arreglo local
                entidad.estado = newState;
                this.presentToast(`La entidad ha sido ${newState ? 'activada' : 'desactivada'} correctamente`, 'success');
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
      message: `¿Estás seguro que deseas eliminar la entidad ${entidad.nombre}? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.eliminarEntidad(entidad.id);
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
