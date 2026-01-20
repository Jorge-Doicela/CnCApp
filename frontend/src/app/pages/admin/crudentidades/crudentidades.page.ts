import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from 'src/supabase';
import { AlertController, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crudentidades',
  templateUrl: './crudentidades.page.html',
  styleUrls: ['./crudentidades.page.scss'],
  standalone: false
})
export class CrudentidadesPage implements OnInit {
  Entidades: any[] = [];
  entidadesFiltradas: any[] = [];
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenPor: string = 'nombre';
  isLoading: boolean = false;

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
    try {
      const { data, error } = await supabase.from('Entidades').select('*');
      if (error) {
        console.error('Error al obtener las entidades:', error.message);
        this.presentToast('Error al cargar entidades: ' + error.message, 'danger');
        return;
      }
      this.Entidades = data ?? [];
      this.entidadesFiltradas = [...this.Entidades];
      this.ordenarEntidades();
      console.log('Entidades cargadas:', this.Entidades);
    } catch (error) {
      console.error('Error inesperado:', error);
      this.presentToast('Error inesperado al cargar entidades', 'danger');
    } finally {
      this.isLoading = false;
    }
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
          handler: async () => {
            try {
              const { error } = await supabase
                .from('Entidades')
                .update({ Estado_Entidad: newState })
                .eq('Id_Entidad', entidad.Id_Entidad);
              if (error) {
                this.presentToast(`Error al ${stateText} la entidad: ${error.message}`, 'danger');
                return;
              }
              // Actualizar el estado en el arreglo local
              entidad.Estado_Entidad = newState;
              this.presentToast(`La entidad ha sido ${newState === 1 ? 'activada' : 'desactivada'} correctamente`, 'success');
            } catch (error: any) {
              this.presentToast(`Error al ${stateText} la entidad: ${error.message}`, 'danger');
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
    try {
      // Primero intentamos eliminar la imagen asociada
      const entidad = this.Entidades.find(e => e.Id_Entidad === id);
      if (entidad && entidad.Imagen_Entidad) {
        const imagePath = entidad.Imagen_Entidad.split('/').pop();
        if (imagePath) {
          await supabase.storage.from('imagenes').remove(['entidades/' + imagePath]);
        }
      }

      // Luego eliminamos el registro
      const { error } = await supabase
        .from('Entidades')
        .delete()
        .eq('Id_Entidad', id);

      if (error) {
        console.error('Error al eliminar la entidad:', error.message);
        this.presentToast('Error al eliminar la entidad: ' + error.message, 'danger');
        return;
      }

      this.presentToast('Entidad eliminada correctamente', 'success');
      // Actualizar la lista de entidades
      this.RecuperarEntidades();
    } catch (error) {
      console.error('Error inesperado al eliminar:', error);
      this.presentToast('Error inesperado al eliminar la entidad', 'danger');
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
