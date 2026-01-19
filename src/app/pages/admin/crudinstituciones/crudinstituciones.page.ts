import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-crudinstituciones',
  templateUrl: './crudinstituciones.page.html',
  styleUrls: ['./crudinstituciones.page.scss'],
  standalone: false
})
export class CrudinstitucionesPage implements OnInit {

  instituciones: any[] = [];
  institucionesFiltradas: any[] = [];
  cargando: boolean = true;
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenarPor: string = 'nombre';
  institucionesActivas: number = 0;

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
    await this.obtenerInstituciones();
    this.cargando = false;
  }

  async obtenerInstituciones() {
    const loading = await this.loadingController.create({
      message: 'Obteniendo instituciones...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data: instituciones, error } = await supabase
        .from('instituciones_sistema')
        .select('*');

      if (error) {
        this.presentToast('Error al obtener instituciones: ' + error.message, 'danger');
        return;
      }

      // Añadir un campo de fecha de última actualización (simulado si no existe)
      this.instituciones = (instituciones || []).map((inst: any) => ({
        ...inst,
        fecha_ultima_actualizacion: inst.fecha_ultima_actualizacion || new Date().toISOString()
      }));

      this.calcularEstadisticas();
      this.filtrarInstituciones();
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  calcularEstadisticas() {
    this.institucionesActivas = this.instituciones.filter(i => i.estado_institucion === true).length;
  }

  filtrarInstituciones() {
    this.institucionesFiltradas = this.instituciones.filter(institucion => {
      // Filtrar por término de búsqueda (en nombre, dirección, email o teléfono)
      const matchesSearchTerm = this.searchTerm.trim() === '' ||
        institucion.nombre_institucion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        institucion.id_institucion.toString().includes(this.searchTerm.toLowerCase()) ||
        (institucion.direccion && institucion.direccion.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (institucion.email && institucion.email.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (institucion.telefono && institucion.telefono.includes(this.searchTerm));

      // Filtrar por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        institucion.estado_institucion.toString() === this.filtroEstado;

      return matchesSearchTerm && matchesEstado;
    });

    // Ordenar resultados
    if (this.ordenarPor === 'nombre') {
      this.institucionesFiltradas.sort((a, b) => a.nombre_institucion.localeCompare(b.nombre_institucion));
    } else if (this.ordenarPor === 'id') {
      this.institucionesFiltradas.sort((a, b) => a.id_institucion - b.id_institucion);
    }
  }

  crearInstitucion() {
    this.router.navigate(['/gestionar-instituciones/crear']);
  }

  editarInstitucion(idInstitucion: number) {
    this.router.navigate(['/gestionar-instituciones/editar', idInstitucion]);
  }

  async cambiarEstado(institucion: any) {
    const loading = await this.loadingController.create({
      message: 'Actualizando estado...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const nuevoEstado = !institucion.estado_institucion;
      const { error } = await supabase
        .from('instituciones_sistema')
        .update({
          estado_institucion: nuevoEstado,
          fecha_ultima_actualizacion: new Date().toISOString()
        })
        .eq('id_institucion', institucion.id_institucion);

      if (error) {
        this.presentToast('Error al cambiar estado: ' + error.message, 'danger');
        return;
      }

      // Actualizar el objeto local
      institucion.estado_institucion = nuevoEstado;
      institucion.fecha_ultima_actualizacion = new Date().toISOString();
      this.calcularEstadisticas();
      this.presentToast(
        `Institución "${institucion.nombre_institucion}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`,
        'success'
      );
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async confirmarEliminar(institucion: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar la institución "${institucion.nombre_institucion}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.eliminarInstitucion(institucion.id_institucion);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarInstitucion(idInstitucion: number) {
    const loading = await this.loadingController.create({
      message: 'Eliminando institución...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { error } = await supabase
        .from('instituciones_sistema')
        .delete()
        .eq('id_institucion', idInstitucion);

      if (error) {
        this.presentToast('Error al eliminar institución: ' + error.message, 'danger');
        return;
      }

      this.presentToast('Institución eliminada correctamente', 'success');
      this.obtenerInstituciones();
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
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
          side: 'end',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
