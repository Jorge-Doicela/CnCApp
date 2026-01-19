import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crudprovincias',
  templateUrl: './crudprovincias.page.html',
  styleUrls: ['./crudprovincias.page.scss'],
  standalone: false
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

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.obtenerProvincias();
  }

  async obtenerProvincias() {
    try {
      const { data, error } = await supabase
        .from('Provincias')
        .select('*')
        .order('Nombre_Provincia', { ascending: true });

      if (error) {
        console.error('Error al obtener provincias:', error);
        this.presentToast('Error al cargar provincias. Por favor, intente nuevamente.', 'danger');
      } else {
        this.provincias = data || [];
        this.filteredProvincias = [...this.provincias];
        this.calcularEstadisticas();
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      this.presentToast('Error en el servidor. Por favor, intente más tarde.', 'danger');
    }
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

  async cambiarEstado(provincia: any) {
    try {
      const nuevoEstado = !provincia.Estado;
      const { error } = await supabase
        .from('Provincias')
        .update({ Estado: nuevoEstado })
        .eq('IdProvincia', provincia.IdProvincia);

      if (error) {
        console.error('Error al cambiar estado:', error);
        this.presentToast('Error al cambiar el estado de la provincia', 'danger');
      } else {
        // Actualizar el objeto local
        provincia.Estado = nuevoEstado;
        this.calcularEstadisticas();
        this.presentToast(
          `Provincia "${provincia.Nombre_Provincia}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      this.presentToast('Error en el servidor. Por favor, intente más tarde.', 'danger');
    }
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

  async eliminarProvincia(provincia: any) {
    try {
      const { error } = await supabase
        .from('Provincias')
        .delete()
        .eq('IdProvincia', provincia.IdProvincia);

      if (error) {
        console.error('Error al eliminar provincia:', error);
        this.presentToast('Error al eliminar la provincia. Puede que tenga registros relacionados.', 'danger');
      } else {
        // Actualizar listas locales
        this.provincias = this.provincias.filter(p => p.IdProvincia !== provincia.IdProvincia);
        this.filteredProvincias = this.filteredProvincias.filter(p => p.IdProvincia !== provincia.IdProvincia);
        this.calcularEstadisticas();
        this.presentToast(`Provincia "${provincia.Nombre_Provincia}" eliminada correctamente`, 'success');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      this.presentToast('Error en el servidor. Por favor, intente más tarde.', 'danger');
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
