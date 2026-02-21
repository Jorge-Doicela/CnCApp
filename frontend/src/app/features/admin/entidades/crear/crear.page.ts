import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearPage implements OnInit {
  nombreEntidad: string = '';
  estadoEntidad: number = 1;
  previsualizacionImagen: string = '';
  formSubmitted: boolean = false;
  imageFile: File | null = null;
  enviando: boolean = false;

  private catalogoService = inject(CatalogoService);
  private cd = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() { }

  // Función para subir la imagen
  subirImagen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = (event: any) => {
      const file = event.target.files[0];

      if (file) {
        // Guardar el archivo para usarlo después
        this.imageFile = file;

        if (!file.type.startsWith('image/')) {
          this.presentToast('Por favor, selecciona una imagen válida', 'danger');
          this.imageFile = null;
          this.cd.markForCheck();
          return;
        }

        // Validar tamaño máximo (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.presentToast('La imagen no debe superar los 5MB', 'warning');
          this.imageFile = null;
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

        this.presentToast('Imagen seleccionada correctamente', 'success');
      }
    };
  }

  // Función para cancelar y volver atrás
  cancelar() {
    this.router.navigate(['/gestionar-entidades']);
  }

  // Función para enviar el formulario
  async onSubmit() {
    this.formSubmitted = true;
    this.cd.markForCheck();

    // Validar que todos los campos requeridos estén completos
    if (!this.nombreEntidad) {
      this.presentToast('Por favor, complete todos los campos obligatorios', 'danger');
      return;
    }

    // Validar que el nombre tenga al menos 3 caracteres
    if (this.nombreEntidad.trim().length < 3) {
      this.presentToast('El nombre debe tener al menos 3 caracteres', 'warning');
      return;
    }

    this.enviando = true;
    this.cd.markForCheck();

    // Mostrar loader
    const loading = await this.loadingController.create({
      message: 'Creando entidad...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      // Note: Image upload to be handled by a storage service in production
      const imageUrl = this.previsualizacionImagen || 'assets/placeholder.png';

      const nuevaEntidad = {
        nombre: this.nombreEntidad,
        imagen: imageUrl,
        estado: this.estadoEntidad === 1
      };

      await firstValueFrom(this.catalogoService.createItem('entidades', nuevaEntidad));

      loading.dismiss();
      this.enviando = false;
      this.cd.markForCheck();
      this.presentAlertExito();
    } catch (error: any) {
      console.error('Error al crear la entidad:', error);
      this.presentToast('Error al crear la entidad: ' + (error.message || error.statusText), 'danger');
      loading.dismiss();
      this.enviando = false;
      this.cd.markForCheck();
    }
  }

  async presentAlertExito() {
    const alert = await this.alertController.create({
      header: '¡Entidad creada correctamente!',
      message: `La entidad <strong>${this.nombreEntidad}</strong> ha sido creada con éxito.`,
      buttons: [
        {
          text: 'Ver listado',
          handler: () => {
            this.router.navigate(['/gestionar-entidades']);
          }
        },
        {
          text: 'Crear otra',
          handler: () => {
            this.resetForm();
          }
        }
      ]
    });

    await alert.present();
  }

  resetForm() {
    this.nombreEntidad = '';
    this.previsualizacionImagen = '';
    this.estadoEntidad = 1;
    this.formSubmitted = false;
    this.imageFile = null;
    this.cd.markForCheck();
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
