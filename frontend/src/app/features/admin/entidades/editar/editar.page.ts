import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
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
  idEntidad: string = '';
  entidad: any = {
    nombre: '',
    imagen: '',
    estado: true
  };
  nuevaImagen: File | null = null;
  previsualizacionImagen: string = '';
  formSubmitted: boolean = false;
  isLoading: boolean = true;
  enviando: boolean = false;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idEntidad = id;
      console.log('ID de la entidad:', this.idEntidad);
      this.cargarEntidad();
    } else {
      this.presentToast('Error: ID de entidad no encontrado', 'danger');
      this.router.navigate(['/gestionar-entidades']);
    }
  }

  async cargarEntidad() {
    this.isLoading = true;
    this.cd.markForCheck();
    try {
      const data = await firstValueFrom(this.catalogoService.getItem('entidades', this.idEntidad));
      if (!data) {
        this.presentToast('No se encontró la entidad solicitada', 'warning');
        this.router.navigate(['/gestionar-entidades']);
        return;
      }
      this.entidad = data;
      // Normalizar nombre_entidad a nombre ya que el backend espera nombre
      if (this.entidad.Nombre_Entidad) {
        this.entidad.nombre = this.entidad.Nombre_Entidad;
      }
      console.log('Entidad cargada:', this.entidad);
    } catch (error: any) {
      console.error('Error al cargar la entidad:', error);
      this.presentToast('Error al cargar datos de la entidad: ' + (error.message || error.statusText), 'danger');
      this.router.navigate(['/gestionar-entidades']);
    } finally {
      this.isLoading = false;
      this.cd.markForCheck();
    }
  }

  // Función para seleccionar una nueva imagen
  async onImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.nuevaImagen = file;

        if (!file.type.startsWith('image/')) {
          this.presentToast('Por favor, selecciona una imagen válida', 'danger');
          this.nuevaImagen = null;
          this.cd.markForCheck();
          return;
        }

        // Validar tamaño máximo (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.presentToast('La imagen no debe superar los 5MB', 'warning');
          this.nuevaImagen = null;
          this.cd.markForCheck();
          return;
        }

        // Crear previsualización
        const reader = new FileReader();
        reader.onload = () => {
          this.previsualizacionImagen = reader.result as string;
          this.cd.markForCheck();
        };
        reader.readAsDataURL(file);

        this.presentToast('Nueva imagen seleccionada correctamente', 'success');
      }
    };
  }

  // Función para cancelar la edición
  cancelar() {
    this.router.navigate(['/gestionar-entidades']);
  }

  // Función para enviar el formulario actualizado
  async onSubmit() {
    this.formSubmitted = true;
    this.cd.markForCheck();

    // Validar que todos los campos requeridos estén completos
    if (!this.entidad.nombre) {
      this.presentToast('El nombre de la entidad es obligatorio', 'danger');
      return;
    }

    // Validar que el nombre tenga al menos 3 caracteres
    if (this.entidad.nombre.trim().length < 3) {
      this.presentToast('El nombre debe tener al menos 3 caracteres', 'warning');
      return;
    }

    this.enviando = true;
    this.cd.markForCheck();

    // Mostrar loader
    const loading = await this.loadingController.create({
      message: 'Actualizando entidad...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      let updatedImageUrl = this.entidad.imagen;

      // Si hay una nueva imagen, subirla primero
      if (this.nuevaImagen) {
        // TODO: Implement backend image upload
        console.log('Image upload pending backend implementation');
      }

      const dataToUpdate = {
        nombre: this.entidad.nombre,
        imagen: updatedImageUrl,
        estado: this.entidad.estado,
      };

      await firstValueFrom(this.catalogoService.updateItem('entidades', this.idEntidad, dataToUpdate));

      loading.dismiss();
      this.enviando = false;
      this.cd.markForCheck();
      this.presentAlertExito();

    } catch (error: any) {
      console.error('Error al actualizar la entidad:', error);
      this.presentToast('Error al actualizar la entidad: ' + (error.message || error.statusText), 'danger');
      loading.dismiss();
      this.enviando = false;
      this.cd.markForCheck();
    }
  }

  async presentAlertExito() {
    const alert = await this.alertController.create({
      header: '¡Entidad actualizada correctamente!',
      message: `Los cambios en la entidad <strong>${this.entidad.nombre}</strong> han sido guardados.`,
      buttons: [
        {
          text: 'Volver al listado',
          handler: () => {
            this.router.navigate(['/gestionar-entidades']);
          }
        }
      ]
    });

    await alert.present();
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
