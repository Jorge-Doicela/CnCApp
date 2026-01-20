import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { supabase } from 'src/supabase';

@Component({
  selector: 'app-crudcompetencias',
  templateUrl: './crudcompetencias.page.html',
  styleUrls: ['./crudcompetencias.page.scss'],
  standalone: false
})
export class CrudcompetenciasPage implements OnInit {

  competencias: any[] = [];
  competenciasFiltradas: any[] = [];
  cargando: boolean = true;
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenarPor: string = 'nombre';
  competenciasActivas: number = 0;

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
    await this.obtenerCompetencias();
    this.cargando = false;
  }

  async obtenerCompetencias() {
    const loading = await this.loadingController.create({
      message: 'Obteniendo competencias...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data: competencias, error } = await supabase
        .from('competencias')
        .select('*');

      if (error) {
        this.presentToast('Error al obtener competencias: ' + error.message, 'danger');
        return;
      }

      // Añadir un campo de fecha de última actualización (simulado si no existe)
      this.competencias = (competencias || []).map((comp: any) => ({
        ...comp,
        fecha_ultima_actualizacion: comp.fecha_ultima_actualizacion || new Date().toISOString()
      }));

      this.calcularEstadisticas();
      this.filtrarCompetencias();
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  calcularEstadisticas() {
    this.competenciasActivas = this.competencias.filter(c => c.estado_competencia === true).length;
  }

  filtrarCompetencias() {
    this.competenciasFiltradas = this.competencias.filter(competencia => {
      // Filtrar por término de búsqueda
      const matchesSearchTerm = this.searchTerm.trim() === '' ||
        competencia.nombre_competencias.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        competencia.id_competencias.toString().includes(this.searchTerm.toLowerCase());

      // Filtrar por estado
      const matchesEstado = this.filtroEstado === 'todos' ||
        competencia.estado_competencia.toString() === this.filtroEstado;

      return matchesSearchTerm && matchesEstado;
    });

    // Ordenar resultados
    if (this.ordenarPor === 'nombre') {
      this.competenciasFiltradas.sort((a, b) => a.nombre_competencias.localeCompare(b.nombre_competencias));
    } else if (this.ordenarPor === 'id') {
      this.competenciasFiltradas.sort((a, b) => a.id_competencias - b.id_competencias);
    }
  }

  crearCompetencia() {
    this.router.navigate(['/gestionar-competencias/crear']);
  }

  editarCompetencia(idCompetencia: number) {
    this.router.navigate(['/gestionar-competencias/editar', idCompetencia]);
  }

  async cambiarEstado(competencia: any) {
    const loading = await this.loadingController.create({
      message: 'Actualizando estado...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const nuevoEstado = !competencia.estado_competencia;
      const { error } = await supabase
        .from('competencias')
        .update({
          estado_competencia: nuevoEstado,
          fecha_ultima_actualizacion: new Date().toISOString()
        })
        .eq('id_competencias', competencia.id_competencias);

      if (error) {
        this.presentToast('Error al cambiar estado: ' + error.message, 'danger');
        return;
      }

      // Actualizar el objeto local
      competencia.estado_competencia = nuevoEstado;
      competencia.fecha_ultima_actualizacion = new Date().toISOString();
      this.calcularEstadisticas();
      this.presentToast(
        `Competencia "${competencia.nombre_competencias}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`,
        'success'
      );
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async confirmarEliminar(competencia: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar la competencia "${competencia.nombre_competencias}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.eliminarCompetencia(competencia.id_competencias);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarCompetencia(idCompetencia: number) {
    const loading = await this.loadingController.create({
      message: 'Eliminando competencia...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { error } = await supabase
        .from('competencias')
        .delete()
        .eq('id_competencias', idCompetencia);

      if (error) {
        this.presentToast('Error al eliminar competencia: ' + error.message, 'danger');
        return;
      }

      this.presentToast('Competencia eliminada correctamente', 'success');
      this.obtenerCompetencias();
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
