// perfil.page.ts - Updated version with location names
import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { AlertController, LoadingController, ToastController, ActionSheetController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  datosUsuario: any = null;
  cargando: boolean = true;
  capacitacionesInscritas: number = 0;
  certificadosObtenidos: number = 0;
  ubicacionUsuario: string = '';
  provinciaUsuario: string = '';
  cantonUsuario: string = '';
  parroquiaUsuario: string = '';

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.cargarPerfil();
  }

  ionViewWillEnter() {
    this.cargarPerfil();
  }

  async cargarPerfil() {
    this.cargando = true;

    try {
      // Obtener usuario autenticado actual
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        this.presentToast('Error al obtener usuario autenticado: ' + authError?.message, 'danger');
        this.cargando = false;
        return;
      }

      const authUid = authData.user.id;

      // Obtener datos del usuario desde la tabla Usuario
      const { data: usuarioData, error: userError } = await supabase
        .from('Usuario')
        .select('*')
        .eq('auth_uid', authUid)
        .single();

      if (userError) {
        this.presentToast('Error al obtener datos del usuario: ' + userError.message, 'danger');
        this.cargando = false;
        return;
      }

      // Obtener capacitaciones inscritas
      const { data: inscripciones, error: inscripcionesError } = await supabase
        .from('Usuarios_Capacitaciones')
        .select('*')
        .eq('Id_Usuario', usuarioData.Id_Usuario);

      if (!inscripcionesError && inscripciones) {
        this.capacitacionesInscritas = inscripciones.length;

        // Actualización para contar correctamente los certificados
        const certificadosCount = inscripciones.filter(
          (inscripcion: any) => inscripcion.Certificado === true
        ).length;

        this.certificadosObtenidos = certificadosCount;
      }

      // Obtener nombres de ubicación (cantón y parroquia)
      await this.obtenerNombresUbicacion(usuarioData);

      this.datosUsuario = {
        ...usuarioData,
        email: authData.user.email,
        nombreCompleto: `${usuarioData.Nombre_Usuario || ''} ${usuarioData.apellido || ''}`,
        Provincia_Nombre: this.provinciaUsuario,
        Canton_Nombre: this.cantonUsuario,
        Parroquia_Nombre: this.parroquiaUsuario
      };

    } catch (error: any) {
      this.presentToast('Error al cargar el perfil: ' + error.message, 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async obtenerNombresUbicacion(userData: any) {
    try {
      // Si tenemos el código de la parroquia, obtener su nombre y el cantón relacionado
      if (userData.Parroquia_Reside_Usuario) {
        const { data: parroquiaData, error: parroquiaError } = await supabase
          .from('parroquia')
          .select('nombre_parroquia, codigo_canton')
          .eq('codigo_parroquia', userData.Parroquia_Reside_Usuario)
          .single();

        if (!parroquiaError && parroquiaData) {
          this.parroquiaUsuario = parroquiaData.nombre_parroquia;

          // Obtener datos del cantón
          if (parroquiaData.codigo_canton) {
            const { data: cantonData, error: cantonError } = await supabase
              .from('Cantones')
              .select('nombre_canton, codigo_provincia')
              .eq('codigo_canton', parroquiaData.codigo_canton)
              .single();

            if (!cantonError && cantonData) {
              this.cantonUsuario = cantonData.nombre_canton;

              // Obtener datos de la provincia
              if (cantonData.codigo_provincia) {
                const { data: provinciaData, error: provinciaError } = await supabase
                  .from('Provincias')
                  .select('Nombre_Provincia')
                  .eq('Codigo_Provincia', cantonData.codigo_provincia)
                  .single();

                if (!provinciaError && provinciaData) {
                  this.provinciaUsuario = provinciaData.Nombre_Provincia;
                }
              }
            }
          }
        }
      }
      // Si solo tenemos el código del cantón pero no la parroquia
      else if (userData.Canton_Reside_Usuario) {
        const { data: cantonData, error: cantonError } = await supabase
          .from('Cantones')
          .select('nombre_canton, codigo_provincia')
          .eq('codigo_canton', userData.Canton_Reside_Usuario)
          .single();

        if (!cantonError && cantonData) {
          this.cantonUsuario = cantonData.nombre_canton;

          // Obtener datos de la provincia
          if (cantonData.codigo_provincia) {
            const { data: provinciaData, error: provinciaError } = await supabase
              .from('Provincias')
              .select('Nombre_Provincia')
              .eq('Codigo_Provincia', cantonData.codigo_provincia)
              .single();

            if (!provinciaError && provinciaData) {
              this.provinciaUsuario = provinciaData.Nombre_Provincia;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al obtener nombres de ubicación:', error);
    }
  }

  obtenerRolTexto(rolId: number): string {
    switch (rolId) {
      case 1: return 'Usuario';
      case 2: return 'Administrador';
      default: return 'Rol desconocido';
    }
  }

  async editarPerfil() {
    try {
      // Usamos el router.navigate con la ruta completa desde la raíz
      this.router.navigate(['ver-perfil/editar'], {
        state: {
          usuario: this.datosUsuario,
          modoFirma: false
        }
      });
    } catch (error) {
      console.error('Error en navegación a editar perfil:', error);
      this.presentToast('Error al navegar a editar perfil', 'danger');
    }
  }

  async navegarAFirma() {
    try {
      // Usamos el router.navigate con la ruta completa desde la raíz
      this.router.navigate(['ver-perfil/firma'], {
        state: {
          usuario: this.datosUsuario
        }
      });
    } catch (error) {
      console.error('Error en navegación a firma:', error);
      this.presentToast('Error al navegar a la página de firma', 'danger');
    }
  }

  async cambiarContrasena() {
    const alert = await this.alertController.create({
      header: 'Cambiar contraseña',
      inputs: [
        {
          name: 'contrasenaActual',
          type: 'password',
          placeholder: 'Contraseña actual'
        },
        {
          name: 'nuevaContrasena',
          type: 'password',
          placeholder: 'Nueva contraseña'
        },
        {
          name: 'confirmarContrasena',
          type: 'password',
          placeholder: 'Confirmar nueva contraseña'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cambiar',
          handler: async (data) => {
            if (data.nuevaContrasena !== data.confirmarContrasena) {
              this.presentToast('Las contraseñas no coinciden', 'danger');
              return false;
            }
            await this.actualizarContrasena(data.nuevaContrasena);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async actualizarContrasena(nuevaContrasena: string) {
    const loading = await this.loadingController.create({
      message: 'Actualizando contraseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { error } = await supabase.auth.updateUser({
        password: nuevaContrasena
      });

      if (error) {
        this.presentToast('Error al actualizar contraseña: ' + error.message, 'danger');
        return;
      }

      this.presentToast('Contraseña actualizada correctamente', 'success');
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async actualizarFotoPerfil() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar fuente de imagen',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.capturarFoto(CameraSource.Camera);
          }
        },
        {
          text: 'Galería',
          icon: 'image',
          handler: () => {
            this.capturarFoto(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async capturarFoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 500,
        height: 500,
        correctOrientation: true
      });

      if (image.dataUrl) {
        const loading = await this.loadingController.create({
          message: 'Subiendo imagen...',
          spinner: 'crescent'
        });
        await loading.present();

        try {
          // Convertir dataUrl a Blob
          const response = await fetch(image.dataUrl);
          const blob = await response.blob();

          // Generar nombre de archivo único
          const userId = this.datosUsuario.Id_Usuario;
          const extension = this.getFileExtensionFromMimeType(image.format || 'jpeg');
          const filename = `${uuidv4()}.${extension}`;
          const filePath = `foto-perfil/${userId}/${filename}`;

          // Subir a Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('imagenes')
            .upload(filePath, blob);

          if (uploadError) {
            throw new Error(uploadError.message);
          }

          // Obtener URL pública
          const { data: urlData } = await supabase.storage
            .from('imagenes')
            .getPublicUrl(filePath);

          const imageUrl = urlData.publicUrl;

          // Actualizar perfil en la base de datos
          const { error: updateError } = await supabase
            .from('Usuario')
            .update({ Imagen_Perfil: imageUrl })
            .eq('Id_Usuario', this.datosUsuario.Id_Usuario);

          if (updateError) {
            throw new Error(updateError.message);
          }

          // Actualizar los datos locales
          this.datosUsuario.Imagen_Perfil = imageUrl;
          this.presentToast('Foto de perfil actualizada correctamente', 'success');
        } catch (error: any) {
          this.presentToast('Error al subir la imagen: ' + error.message, 'danger');
        } finally {
          loading.dismiss();
        }
      }
    } catch (error: any) {
      this.presentToast('Error al capturar la imagen: ' + error.message, 'danger');
    }
  }

  getFileExtensionFromMimeType(format: string): string {
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return 'jpg';
      case 'png':
        return 'png';
      default:
        return 'jpg';
    }
  }

  async cerrarSesion() {
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        this.presentToast('Error al cerrar sesión: ' + error.message, 'danger');
        return;
      }

      this.presentToast('Sesión cerrada correctamente', 'success');
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
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
