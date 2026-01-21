import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/services/catalogo.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EditarPage implements OnInit {

  idInstitucion: number = 0;
  institucion: any = {
    id_institucion: 0,
    nombre_institucion: '',
    direccion: '',
    telefono: '',
    email: '',
    descripcion: '',
    estado_institucion: false,
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
    this.idInstitucion = Number(this.route.snapshot.paramMap.get('idInstitucion'));
    this.cargarInstitucion();
  }

  async cargarInstitucion() {
    this.cargando = true;

    const loading = await this.loadingController.create({
      message: 'Cargando información...',
      spinner: 'crescent'
    });
    await loading.present();

    if (!this.idInstitucion) {
      loading.dismiss();
      this.cargando = false;
      return;
    }

    this.catalogoService.getItem('instituciones', this.idInstitucion).subscribe({
      next: (data) => {
        if (!data) {
          this.presentToast('No se encontró la institución.', 'danger');
          loading.dismiss();
          this.cargando = false;
          return;
        }

        this.institucion = data;

        // Formatear fecha para mostrar
        if (this.institucion.fecha_ultima_actualizacion) {
          const fecha = new Date(this.institucion.fecha_ultima_actualizacion);
          this.fechaModificacion = fecha.toLocaleString();
        }
        loading.dismiss();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar institución:', error);
        this.presentToast('Error al cargar institución: ' + (error.message || error.statusText), 'danger');
        loading.dismiss();
        this.cargando = false;
      }
    });
  }

  async actualizarInstitucion() {
    if (!this.institucion.nombre_institucion.trim()) {
      this.presentToast('El nombre de la institución es obligatorio', 'warning');
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
      nombre_institucion: this.institucion.nombre_institucion,
      direccion: this.institucion.direccion,
      telefono: this.institucion.telefono,
      email: this.institucion.email,
      descripcion: this.institucion.descripcion,
      estado_institucion: this.institucion.estado_institucion,
      fecha_ultima_actualizacion: fechaActual
    };

    this.catalogoService.updateItem('instituciones', this.idInstitucion, dataToUpdate).subscribe({
      next: async () => {
        this.fechaModificacion = new Date(fechaActual).toLocaleString();
        this.presentToast('Institución actualizada exitosamente', 'success');
        loading.dismiss();
        this.enviando = false;
      },
      error: async (error) => {
        console.error('Error al actualizar institución:', error);
        this.presentToast('Error al actualizar institución: ' + (error.message || error.statusText), 'danger');
        loading.dismiss();
        this.enviando = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/gestionar instituciones']);
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
