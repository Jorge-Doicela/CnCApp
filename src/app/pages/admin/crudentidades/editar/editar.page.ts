import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from 'src/supabase';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: false
})
export class EditarPage implements OnInit {
  idEntidad: string = '';
  entidad: any = {
    Nombre_Entidad: '',
    Imagen_Entidad: '',
    Estado_Entidad: 1
  };
  nuevaImagen: File | null = null;
  previsualizacionImagen: string = '';
  formSubmitted: boolean = false;
  isLoading: boolean = true;
  enviando: boolean = false;

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

  // Función para cargar los datos de la entidad específica
  async cargarEntidad() {
    this.isLoading = true;
    try {
      const { data, error } = await supabase
        .from('Entidades')
        .select('*')
        .eq('Id_Entidad', this.idEntidad)
        .single();

      if (error) {
        console.error('Error al cargar la entidad:', error.message);
        this.presentToast('Error al cargar datos de la entidad: ' + error.message, 'danger');
        this.router.navigate(['/gestionar-entidades']);
        return;
      }

      if (!data) {
        this.presentToast('No se encontró la entidad solicitada', 'warning');
        this.router.navigate(['/gestionar-entidades']);
        return;
      }

      this.entidad = data;
      console.log('Entidad cargada:', this.entidad);
    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.presentToast('Error inesperado al cargar la entidad', 'danger');
    } finally {
      this.isLoading = false;
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
          return;
        }

        // Validar tamaño máximo (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.presentToast('La imagen no debe superar los 5MB', 'warning');
          this.nuevaImagen = null;
          return;
        }

        // Crear previsualización
        const reader = new FileReader();
        reader.onload = () => {
          this.previsualizacionImagen = reader.result as string;
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

    // Validar que todos los campos requeridos estén completos
    if (!this.entidad.Nombre_Entidad) {
      this.presentToast('El nombre de la entidad es obligatorio', 'danger');
      return;
    }

    // Validar que el nombre tenga al menos 3 caracteres
    if (this.entidad.Nombre_Entidad.trim().length < 3) {
      this.presentToast('El nombre debe tener al menos 3 caracteres', 'warning');
      return;
    }

    this.enviando = true;

    // Mostrar loader
    const loading = await this.loadingController.create({
      message: 'Actualizando entidad...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      let updatedImageUrl = this.entidad.Imagen_Entidad;

      // Si hay una nueva imagen, subirla primero
      if (this.nuevaImagen) {
        // Intentar eliminar la imagen anterior si existe
        if (this.entidad.Imagen_Entidad) {
          const oldImagePath = this.entidad.Imagen_Entidad.split('/').pop();
          if (oldImagePath) {
            await supabase.storage.from('imagenes').remove(['entidades/' + oldImagePath]);
          }
        }

        // Subir la nueva imagen
        const extension = this.nuevaImagen.name.split('.').pop();
        // Generar nombre único para evitar colisiones
        const uniqueId = new Date().getTime();
        const nombreImagen = `${this.entidad.Nombre_Entidad.replace(/\s+/g, '_')}_${uniqueId}.${extension}`;

        /*
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('imagenes')
          .upload('entidades/' + nombreImagen, this.nuevaImagen);

        if (uploadError) { ... }

        // Actualizar la URL de la imagen
        updatedImageUrl = `${environment.supabaseUrl}/storage/v1/object/public/imagenes/${uploadData.path}`;
        */
        console.log('TODO: Implementar subida de imagen nueva en backend');
      }

      /*
      // Actualizar la entidad en la base de datos
      const { data, error } = await supabase
        .from('Entidades')
        .update({
          Nombre_Entidad: this.entidad.Nombre_Entidad,
          Imagen_Entidad: updatedImageUrl,
          Estado_Entidad: this.entidad.Estado_Entidad,
        })
        .eq('Id_Entidad', this.idEntidad);
      */

      console.log('TODO: Implementar actualización de entidad en backend Node.js');
      loading.dismiss();
      this.enviando = false;
      this.presentToast('Funcionalidad en migración al nuevo backend', 'warning');
      this.cancelar();
      return;

      /*
      if (error) {
        console.error('Error al actualizar la entidad:', error.message);
        this.presentToast('Error al actualizar la entidad: ' + error.message, 'danger');
        loading.dismiss();
        this.enviando = false;
        return;
      }
      */

      loading.dismiss();
      this.enviando = false;
      this.presentAlertExito();

    } catch (error: any) {
      console.error('Error al actualizar la entidad:', error);
      this.presentToast('Error inesperado: ' + error.message, 'danger');
      loading.dismiss();
      this.enviando = false;
    }
  }

  async presentAlertExito() {
    const alert = await this.alertController.create({
      header: '¡Entidad actualizada correctamente!',
      message: `Los cambios en la entidad <strong>${this.entidad.Nombre_Entidad}</strong> han sido guardados.`,
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
