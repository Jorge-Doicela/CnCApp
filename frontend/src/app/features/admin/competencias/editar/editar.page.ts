import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarPage implements OnInit {

  idCompetencia: number = 0;
  competencia: any = {
    id_competencias: 0,
    nombre_competencias: '',
    descripcion: '',
    estado_competencia: false,
    fecha_ultima_actualizacion: null
  };

  cargando: boolean = true;
  enviando: boolean = false;
  fechaModificacion: string = 'No disponible';

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.idCompetencia = Number(this.route.snapshot.paramMap.get('idCompetencia'));
    this.cargarCompetencia();
  }

  async cargarCompetencia() {
    const loading = await this.loadingController.create({
      message: 'Cargando información...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      if (!this.idCompetencia) return;

      const data = await firstValueFrom(this.catalogoService.getItem('competencias', this.idCompetencia));

      if (!data) {
        this.presentToast('No se encontró la competencia.', 'danger');
        return;
      }

      this.competencia = data;
      if (this.competencia.fecha_ultima_actualizacion) {
        const fecha = new Date(this.competencia.fecha_ultima_actualizacion);
        this.fechaModificacion = fecha.toLocaleString();
      }
    } catch (error: any) {
      console.error('Error al cargar competencia:', error);
      this.presentToast('Error al cargar competencia: ' + (error.message || error.statusText), 'danger');
    } finally {
      loading.dismiss();
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  async actualizarCompetencia() {
    if (!this.competencia.nombre_competencias.trim()) {
      this.presentToast('El nombre de la competencia es obligatorio', 'warning');
      return;
    }

    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    const fechaActual = new Date().toISOString();
    const dataToUpdate = {
      nombre_competencias: this.competencia.nombre_competencias,
      descripcion: this.competencia.descripcion,
      estado_competencia: this.competencia.estado_competencia,
      fecha_ultima_actualizacion: fechaActual
    };

    try {
      await firstValueFrom(this.catalogoService.updateItem('competencias', this.idCompetencia, dataToUpdate));
      this.fechaModificacion = new Date(fechaActual).toLocaleString();
      this.presentToast('Competencia actualizada exitosamente', 'success');
    } catch (error: any) {
      console.error('Error al actualizar competencia:', error);
      this.presentToast('Error al actualizar competencia: ' + (error.message || error.statusText), 'danger');
    } finally {
      loading.dismiss();
      this.enviando = false;
      this.cd.markForCheck();
    }
  }

  cancelar() {
    this.router.navigate(['/gestionar competencias']);
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
