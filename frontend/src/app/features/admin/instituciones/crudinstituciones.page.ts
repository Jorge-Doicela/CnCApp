import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  search,
  funnelOutline,
  businessOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  alertCircleOutline,
  keyOutline,
  createOutline,
  trashOutline,
  swapVerticalOutline,
  addCircleOutline,
  locationOutline,
  callOutline,
  mailOutline,
  calendarOutline,
  close
} from 'ionicons/icons';

@Component({
  selector: 'app-crudinstituciones',
  templateUrl: './crudinstituciones.page.html',
  styleUrls: ['./crudinstituciones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudinstitucionesPage implements OnInit {

  instituciones: any[] = [];
  institucionesFiltradas: any[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  ordenarPor: string = 'nombre';
  institucionesActivas: number = 0;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({
      searchOutline,
      search,
      funnelOutline,
      businessOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      alertCircleOutline,
      keyOutline,
      createOutline,
      trashOutline,
      swapVerticalOutline,
      addCircleOutline,
      locationOutline,
      callOutline,
      mailOutline,
      calendarOutline,
      close
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.isLoading = true;
    this.cd.markForCheck();
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('instituciones'));
      this.instituciones = (data || []).map((inst: any) => ({
        ...inst,
        fecha_ultima_actualizacion: inst.fecha_ultima_actualizacion || new Date().toISOString()
      }));
      this.calcularEstadisticas();
      this.filtrarInstituciones();
    } catch (error: any) {
      this.errorToast('Error al obtener instituciones: ' + (error?.message ?? ''));
    } finally {
      this.isLoading = false;
      this.cd.markForCheck();
    }
  }

  calcularEstadisticas() {
    // Note: The backend model currently doesn't have an 'estado' field.
    // Assuming all are active for statistics until the field is added.
    this.institucionesActivas = this.instituciones.length;
  }

  filtrarInstituciones() {
    const term = this.searchTerm.toLowerCase().trim();
    this.institucionesFiltradas = this.instituciones.filter(institucion => {
      const nombre = institucion.nombre?.toLowerCase() || '';
      const tipo = institucion.tipo?.toLowerCase() || '';
      const id = institucion.id?.toString() || '';

      const matchesSearchTerm = term === '' ||
        nombre.includes(term) ||
        id.includes(term) ||
        tipo.includes(term);

      return matchesSearchTerm;
    });

    if (this.ordenarPor === 'nombre') {
      this.institucionesFiltradas.sort((a, b) => {
        const nameA = a.nombre || '';
        const nameB = b.nombre || '';
        return nameA.localeCompare(nameB);
      });
    } else if (this.ordenarPor === 'id') {
      this.institucionesFiltradas.sort((a, b) => (a.id || 0) - (b.id || 0));
    }
    this.cd.markForCheck();
  }

  crearInstitucion() {
    this.router.navigate(['/gestionar-instituciones/crear']);
  }

  editarInstitucion(idInstitucion: number) {
    this.router.navigate(['/gestionar-instituciones/editar', idInstitucion]);
  }

  async cambiarEstado(institucion: any) {
    this.isLoading = true;
    this.cd.markForCheck();

    try {
      const nuevoEstado = !institucion.estado;
      await firstValueFrom(this.catalogoService.updateItem('instituciones', institucion.id, {
        estado: nuevoEstado,
        fecha_ultima_actualizacion: new Date().toISOString()
      }));

      institucion.estado = nuevoEstado;
      institucion.fecha_ultima_actualizacion = new Date().toISOString();
      this.calcularEstadisticas();
      this.successToast(`Institución "${institucion.nombre}" ahora está ${nuevoEstado ? 'activa' : 'inactiva'}`);
    } catch (error: any) {
      this.errorToast('Error al cambiar estado: ' + (error?.message ?? ''));
    } finally {
      this.isLoading = false;
      this.cd.markForCheck();
    }
  }

  async confirmarEliminar(institucion: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar la institución "${institucion.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'secondary' },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => this.eliminarInstitucion(institucion.id)
        }
      ]
    });
    await alert.present();
  }

  async eliminarInstitucion(idInstitucion: number) {
    this.isLoading = true;
    this.cd.markForCheck();

    try {
      await firstValueFrom(this.catalogoService.deleteItem('instituciones', idInstitucion));
      this.successToast('Institución eliminada correctamente');
      await this.cargarDatos();
    } catch (error: any) {
      this.errorToast('Error al eliminar institución: ' + (error?.message ?? ''));
    } finally {
      this.isLoading = false;
      this.cd.markForCheck();
    }
  }

  private async successToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'bottom',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  private async errorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
