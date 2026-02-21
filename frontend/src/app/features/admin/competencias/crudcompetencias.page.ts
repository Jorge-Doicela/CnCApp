import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crudcompetencias',
  templateUrl: './crudcompetencias.page.html',
  styleUrls: ['./crudcompetencias.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudcompetenciasPage implements OnInit {

  competencias: any[] = [];
  competenciasFiltradas: any[] = [];
  cargando: boolean = true;
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenarPor: string = 'nombre';
  competenciasActivas: number = 0;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

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
    this.cd.markForCheck();
    await this.obtenerCompetencias();
    this.cargando = false;
    this.cd.markForCheck();
  }

  async obtenerCompetencias() {
    const loading = await this.loadingController.create({
      message: 'Obteniendo competencias...',
      spinner: 'crescent'
    });
    await loading.present();
    try {
      const competencias = await firstValueFrom(this.catalogoService.getItems('competencias'));
      this.competencias = (competencias || []).map((comp: any) => ({
        ...comp,
        fecha_ultima_actualizacion: comp.fecha_ultima_actualizacion || new Date().toISOString()
      }));
      this.calcularEstadisticas();
      this.filtrarCompetencias();
    } catch (error: any) {
      this.presentToast('Error al obtener competencias: ' + (error?.message ?? ''), 'danger');
    } finally {
      loading.dismiss();
      this.cd.markForCheck();
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
    this.cd.markForCheck();
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

    const nuevoEstado = !competencia.estado_competencia;

    try {
      await firstValueFrom(this.catalogoService.updateItem('competencias', competencia.id_competencias, {
        estado_competencia: nuevoEstado,
        fecha_ultima_actualizacion: new Date().toISOString()
      }));
      // Actualizar el objeto local
      competencia.estado_competencia = nuevoEstado;
      competencia.fecha_ultima_actualizacion = new Date().toISOString();
      this.calcularEstadisticas();
      this.presentToast(
        `Competencia "${competencia.nombre_competencias}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`,
        'success'
      );
    } catch (error: any) {
      this.presentToast('Error al cambiar estado: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
      this.cd.markForCheck();
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
      await firstValueFrom(this.catalogoService.deleteItem('competencias', idCompetencia));
      this.presentToast('Competencia eliminada correctamente', 'success');
      this.obtenerCompetencias();
    } catch (error: any) {
      this.presentToast('Error al eliminar competencia: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
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
          side: 'end',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
