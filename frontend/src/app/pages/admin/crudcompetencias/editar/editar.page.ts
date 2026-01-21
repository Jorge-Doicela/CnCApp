import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
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
    this.cargando = true;

    const loading = await this.loadingController.create({
      message: 'Cargando información...',
      spinner: 'crescent'
    });
    await loading.present();

    if (!this.idCompetencia) {
      loading.dismiss();
      this.cargando = false;
      return;
    }

    this.catalogoService.getItem('competencias', this.idCompetencia).subscribe({
      next: (data) => {
        if (!data) {
          this.presentToast('No se encontró la competencia.', 'danger');
          loading.dismiss();
          this.cargando = false;
          return;
        }

        this.competencia = data;

        // Formatear fecha para mostrar
        if (this.competencia.fecha_ultima_actualizacion) {
          const fecha = new Date(this.competencia.fecha_ultima_actualizacion);
          this.fechaModificacion = fecha.toLocaleString();
        }
        loading.dismiss();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar competencia:', error);
        this.presentToast('Error al cargar competencia: ' + (error.message || error.statusText), 'danger');
        loading.dismiss();
        this.cargando = false;
      }
    });
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

    this.catalogoService.updateItem('competencias', this.idCompetencia, dataToUpdate).subscribe({
      next: async () => {
        this.fechaModificacion = new Date(fechaActual).toLocaleString();
        this.presentToast('Competencia actualizada exitosamente', 'success');
        loading.dismiss();
        this.enviando = false;
      },
      error: async (error) => {
        console.error('Error al actualizar competencia:', error);
        this.presentToast('Error al actualizar competencia: ' + (error.message || error.statusText), 'danger');
        loading.dismiss();
        this.enviando = false;
      }
    });
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
