import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { supabase } from 'src/supabase';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: false
})
export class EditarPage implements OnInit {
  roles: any[] = [];
  entidades: any[] = [];
  usuario: any = {
    Id_Usuario: '',
    Nombre_Usuario: '',
    CI_Usuario: '',
    Rol_Usuario: '',
    Entidad_Usuario: '',
    Estado_Usuario: 1,
    Firma_Usuario: '',
    Firma_Usuario_Imagen: null,
    Celular_Usuario: '',
    Convencional_Usuario: '',
    Genero_Usuario: '',
    Etnia: '',
    Nacionalidad_Usuario: '',
    Fecha_Nacimiento_Usuario: '',
    canton: '',
  };
  cargando: boolean = false;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.mostrarCargando('Cargando información...');

    try {
      this.activatedRoute.params.subscribe(async params => {
        const idUsuario = +params['idUsuario'];

        if (isNaN(idUsuario)) {
          console.error('ID de usuario inválido:', idUsuario);
          this.presentToast('ID de usuario inválido', 'danger');
          this.ocultarCargando();
          this.router.navigate(['/gestionar usuarios']);
          return;
        }

        this.usuario.Id_Usuario = idUsuario;
        await Promise.all([
          this.recuperarRoles(),
          this.recuperarEntidades(),
          this.cargarUsuario()
        ]);

        this.ocultarCargando();
      });
    } catch (error) {
      console.error('Error en inicialización:', error);
      this.presentToast('Error al cargar la página', 'danger');
      this.ocultarCargando();
    }
  }

  async cargarUsuario() {
    try {
      const userId = this.usuario.Id_Usuario;
      if (isNaN(userId)) {
        throw new Error('ID de usuario inválido');
      }

      const { data, error } = await supabase
        .from('Usuario')
        .select('*')
        .eq('Id_Usuario', userId)
        .single();

      if (error) {
        throw new Error(`Error al obtener datos del usuario: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se encontró el usuario');
      }

      this.usuario = {
        Id_Usuario: data.Id_Usuario,
        Nombre_Usuario: data.Nombre_Usuario,
        CI_Usuario: data.CI_Usuario,
        Rol_Usuario: data.Rol_Usuario,
        Entidad_Usuario: data.Entidad_Usuario,
        Estado_Usuario: data.Estado_Usuario,
        Firma_Usuario: data.Firma_Usuario,
        Celular_Usuario: data.Celular_Usuario,
        Convencional_Usuario: data.Convencional_Usuario,
        Genero_Usuario: data.Genero_Usuario,
        Etnia: data.Etnia_Usuario,
        Nacionalidad_Usuario: data.Nacionalidad_Usuario,
        Fecha_Nacimiento_Usuario: data.Fecha_Nacimiento_Usuario,
        canton: data.Canton_Reside_Usuario
      };

    } catch (error) {
      console.error('Error al cargar usuario:', error);
      this.presentToast('Error al cargar los datos del usuario', 'danger');
      throw error;
    }
  }

  async recuperarRoles() {
    try {
      const { data: roles, error } = await supabase
        .from('Rol')
        .select('Id_Rol, nombre_rol');

      if (error) {
        throw new Error(`Error al recuperar roles: ${error.message}`);
      }

      this.roles = roles || [];
    } catch (error) {
      console.error('Error en recuperación de roles:', error);
      this.presentToast('Error al cargar los roles', 'danger');
      throw error;
    }
  }

  async recuperarEntidades() {
    try {
      const { data: entidades, error } = await supabase
        .from('Entidades')
        .select('Id_Entidad, Nombre_Entidad');

      if (error) {
        throw new Error(`Error al recuperar entidades: ${error.message}`);
      }

      this.entidades = entidades || [];
    } catch (error) {
      console.error('Error en recuperación de entidades:', error);
      this.presentToast('Error al cargar las entidades', 'danger');
      throw error;
    }
  }

  seleccionarFirma(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamaño del archivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.presentToast('El tamaño de la firma no debe exceder 2MB', 'warning');
      return;
    }

    // Validar tipo de archivo
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.presentToast('Solo se permiten archivos JPG o PNG', 'warning');
      return;
    }

    this.usuario.Firma_Usuario_Imagen = file;

    // Preview de la imagen
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.usuario.Firma_Usuario = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  eliminarFirma() {
    this.usuario.Firma_Usuario = null;
    this.usuario.Firma_Usuario_Imagen = null;
  }

  async actualizarUsuario() {
    if (!this.validarFormulario()) {
      return;
    }

    await this.mostrarCargando('Guardando cambios...');

    try {
      let firmaUrl = this.usuario.Firma_Usuario;

      // Si hay una nueva imagen de firma
      if (this.usuario.Firma_Usuario_Imagen) {
        const file = this.usuario.Firma_Usuario_Imagen;
        const extension = file instanceof File ? file.name.split('.').pop() : '';
        const nombreImagen = `${this.usuario.Id_Usuario}_${Date.now()}.${extension}`;

        /*
        const { error: uploadError } = await supabase
          .storage
          .from('imagenes')
          .upload(`firmas/${nombreImagen}`, file, { upsert: true });

        if (uploadError) {
          throw new Error(`Error al subir la firma: ${uploadError.message}`);
        }

        firmaUrl = `${environment.supabaseUrl}/storage/v1/object/public/imagenes/firmas/${nombreImagen}`;
        */
        console.log('TODO: Implementar subida de firma en backend');
        // firmaUrl = 'placeholder';
      }

      const datosAEnviar = {
        Rol_Usuario: this.usuario.Rol_Usuario,
        Nombre_Usuario: this.usuario.Nombre_Usuario,
        CI_Usuario: this.usuario.CI_Usuario,
        Estado_Usuario: this.usuario.Estado_Usuario,
        Entidad_Usuario: this.usuario.Entidad_Usuario,
        Firma_Usuario: firmaUrl,
        Celular_Usuario: this.usuario.Celular_Usuario,
        Convencional_Usuario: this.usuario.Convencional_Usuario,
        Genero_Usuario: this.usuario.Genero_Usuario,
        Etnia_Usuario: this.usuario.Etnia,
        Nacionalidad_Usuario: this.usuario.Nacionalidad_Usuario,
        Fecha_Nacimiento_Usuario: this.usuario.Fecha_Nacimiento_Usuario,
        Canton_Reside_Usuario: this.usuario.canton,
      };

      const { error } = await supabase
        .from('Usuario')
        .update(datosAEnviar)
        .eq('Id_Usuario', this.usuario.Id_Usuario);

      if (error) {
        throw new Error(`Error al actualizar usuario: ${error.message}`);
      }

      this.ocultarCargando();
      await this.mostrarAlertaExito('Usuario actualizado correctamente');

      // Navegar de regreso a la lista de usuarios
      this.router.navigate(['/gestionar usuarios']);

    } catch (error) {
      this.ocultarCargando();
      console.error('Error al actualizar usuario:', error);
      this.presentToast('Error al guardar los cambios', 'danger');
    }
  }

  validarFormulario(): boolean {
    if (!this.usuario.Nombre_Usuario?.trim()) {
      this.presentToast('El nombre es obligatorio', 'warning');
      return false;
    }

    if (!this.usuario.CI_Usuario?.trim()) {
      this.presentToast('La cédula es obligatoria', 'warning');
      return false;
    }

    if (!this.usuario.Rol_Usuario) {
      this.presentToast('Debe seleccionar un rol', 'warning');
      return false;
    }

    return true;
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
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

  async mostrarAlertaExito(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Operación Exitosa',
      message: mensaje,
      cssClass: 'success-alert',
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  async mostrarCargando(mensaje: string = 'Cargando...') {
    this.cargando = true;
    const loading = await this.loadingController.create({
      message: mensaje,
      spinner: 'circles'
    });
    await loading.present();
  }

  async ocultarCargando() {
    this.cargando = false;
    try {
      await this.loadingController.dismiss();
    } catch (error) {
      console.log('No hay cargando que cerrar');
    }
  }
}
