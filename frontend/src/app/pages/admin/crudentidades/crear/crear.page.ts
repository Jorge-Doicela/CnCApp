import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from 'src/supabase';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: false
})
export class CrearPage implements OnInit {
  nombreEntidad: string = '';
  estadoEntidad: number = 1;
  previsualizacionImagen: string = '';
  formSubmitted: boolean = false;
  imageFile: File | null = null;
  enviando: boolean = false;

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
          return;
        }

        // Validar tamaño máximo (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.presentToast('La imagen no debe superar los 5MB', 'warning');
          this.imageFile = null;
          return;
        }

        // Crear previsualización
        const reader = new FileReader();
        reader.onload = () => {
          this.previsualizacionImagen = reader.result as string;
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

    // Validar que todos los campos requeridos estén completos
    if (!this.nombreEntidad || !this.imageFile) {
      this.presentToast('Por favor, complete todos los campos obligatorios', 'danger');
      return;
    }

    // Validar que el nombre tenga al menos 3 caracteres
    if (this.nombreEntidad.trim().length < 3) {
      this.presentToast('El nombre debe tener al menos 3 caracteres', 'warning');
      return;
    }

    this.enviando = true;

    // Mostrar loader
    const loading = await this.loadingController.create({
      message: 'Creando entidad...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      // Subir la imagen primero
      const extension = this.imageFile.name.split('.').pop();
      // Generar nombre único para evitar colisiones
      const uniqueId = new Date().getTime();
      const nombreImagen = `${this.nombreEntidad.replace(/\s+/g, '_')}_${uniqueId}.${extension}`;

      /* 
      // TODO: Implementar subida de imagen al backend Node.js
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('imagenes')
        .upload('entidades/' + nombreImagen, this.imageFile);

      if (uploadError) { ... }
      const imageUrl = `${environment.supabaseUrl}/storage/v1/object/public/imagenes/${uploadData.path}`;
      */

      // Placeholder data until backend integration
      const imageUrl = 'assets/placeholder.png';

      /*
     const { data, error } = await supabase
       .from('Entidades')
       .insert([...]);
      */

      console.log('TODO: Implementar creación de entidad en backend Node.js');
      // Simular éxito para no bloquear UI
      loading.dismiss();
      this.enviando = false;
      this.presentToast('Funcionalidad en migración al nuevo backend', 'warning');
      this.cancelar();
      return;

      /* Original code commented out for migration
      if (error) { ... }
      */

      /*
      if (error) {
        console.error('Error al insertar la entidad:', error.message);
        this.presentToast('Error al crear la entidad: ' + error.message, 'danger');
        loading.dismiss();
        this.enviando = false;
        return;
      }
      */

      loading.dismiss();
      this.enviando = false;
      this.presentAlertExito();

    } catch (error: any) {
      console.error('Error al crear la entidad:', error);
      this.presentToast('Error inesperado: ' + error.message, 'danger');
      loading.dismiss();
      this.enviando = false;
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
