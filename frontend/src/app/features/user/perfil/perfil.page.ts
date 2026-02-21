import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// perfil.page.ts - Updated version with HttpClient and no Supabase
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ToastController, ActionSheetController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { v4 as uuidv4 } from 'uuid';
import { environment } from 'src/environments/environment';
import { firstValueFrom, timeout, finalize } from 'rxjs';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
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
    private navController: NavController,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Removed to avoid double loading with ionViewWillEnter
  }

  ionViewWillEnter() {
    this.cargarPerfil();
  }


  cargarPerfil() {
    this.cargando = true;

    const authUid = localStorage.getItem('auth_uid');

    if (!authUid) {
      this.presentToast('No hay sesión activa', 'danger');
      this.cargando = false;
      return;
    }

    const url = `${environment.apiUrl}/users/${authUid}`;

    this.http.get<any>(url).pipe(
      timeout(10000),
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (usuarioData: any) => {
        if (!usuarioData) {
          this.presentToast('No se encontraron datos del usuario', 'warning');
          return;
        }

        // Mapeo de datos para compatibilidad con la vista
        this.datosUsuario = {
          ...usuarioData,
          // Mapear campos que la vista espera con nombres específicos
          Nombre_Usuario: usuarioData.nombre,
          apellido: usuarioData.primerApellido + (usuarioData.segundoApellido ? ' ' + usuarioData.segundoApellido : ''),
          email: usuarioData.email,
          Rol_Usuario: usuarioData.rol?.nombre || 'Usuario',
          Imagen_Perfil: usuarioData.fotoPerfilUrl,
          Firma_Usuario: usuarioData.firmaUrl,
          // Ubicación desde objetos anidados
          Provincia_Nombre: usuarioData.provincia?.nombre || '',
          Canton_Nombre: usuarioData.canton?.nombre || '',
          Parroquia_Nombre: usuarioData.parroquia?.nombre || ''
        };

        this.provinciaUsuario = this.datosUsuario.Provincia_Nombre;
        this.cantonUsuario = this.datosUsuario.Canton_Nombre;
        this.parroquiaUsuario = this.datosUsuario.Parroquia_Nombre;

        // Placeholder para capacitaciones (Viene del backend con _count)
        this.capacitacionesInscritas = usuarioData._count?.inscripciones || 0;
        this.certificadosObtenidos = usuarioData._count?.certificados || 0;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.presentToast('Error al cargar perfil: ' + (err.message || 'Error de conexión'), 'danger');
      }
    });
  }

  obtenerRolTexto(rol: any): string {
    if (typeof rol === 'string') return rol;
    return rol?.nombre || 'Usuario';
  }

  async editarPerfil() {
    try {
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
    // ... Implementación similar alert controller ...
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
      const id = this.datosUsuario?.id;
      if (!id) {
        throw new Error('ID de usuario no encontrado');
      }

      await firstValueFrom(this.http.put(`${environment.apiUrl}/users/${id}`, { password: nuevaContrasena }));
      this.presentToast('Contraseña actualizada correctamente', 'success');
    } catch (error: any) {
      console.error('Error updating password:', error);
      this.presentToast('Error al actualizar: ' + (error.error?.message || error.message), 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async actualizarFotoPerfil() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Actualizar foto de perfil',
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
        resultType: CameraResultType.Base64,
        source: source
      });

      if (image.base64String) {
        await this.subirFoto(image.base64String);
      }
    } catch (error) {
      console.error('Error capturando foto:', error);
    }
  }

  async subirFoto(base64: string) {
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const id = this.datosUsuario?.id;
      // Since we don't have a dedicated storage service yet, we'll send base64 to the backend
      // and let the backend handle it. For now, we'll simulate a URL or use base64 if needed.
      // Ideally, the backend would save it to a file and return a URL.

      const fotoUrl = `data:image/jpeg;base64,${base64}`; // Temporary simulation of uploaded URL

      await firstValueFrom(this.http.put(`${environment.apiUrl}/users/${id}`, { fotoPerfilUrl: fotoUrl }));

      this.datosUsuario.Imagen_Perfil = fotoUrl;
      this.presentToast('Foto de perfil actualizada', 'success');
      this.cdr.detectChanges();
    } catch (error: any) {
      this.presentToast('Error al subir imagen: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
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
      this.authService.clearAuthData();
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
