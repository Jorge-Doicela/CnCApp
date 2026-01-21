import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// perfil.page.ts - Updated version with HttpClient and no Supabase
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ToastController, ActionSheetController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { v4 as uuidv4 } from 'uuid';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

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
    private authService: AuthService
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
      // Obtener usuario autenticado actual desde AuthService o localStorage
      const authUid = localStorage.getItem('auth_uid');

      if (!authUid) {
        this.presentToast('No hay sesión activa', 'danger');
        this.cargando = false;
        return;
      }

      // Obtener datos del usuario desde el Backend
      const usuarioData = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/users/profile/${authUid}`)
      );

      if (!usuarioData) {
        this.presentToast('Error al obtener datos del usuario', 'danger');
        this.cargando = false;
        return;
      }

      // Obtener capacitaciones inscritas (TODO: Implementar endpoint real)
      // const inscripciones = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/users/${usuarioData.Id_Usuario}/inscripciones`));
      const inscripciones: any[] = []; // Placeholder

      if (inscripciones) {
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
        email: 'email@placeholder.com', // El email debería venir del endpoint de profile también
        nombreCompleto: `${usuarioData.Nombre_Usuario || ''} ${usuarioData.apellido || ''}`,
        Provincia_Nombre: this.provinciaUsuario,
        Canton_Nombre: this.cantonUsuario,
        Parroquia_Nombre: this.parroquiaUsuario
      };

    } catch (error: any) {
      this.presentToast('Error al cargar el perfil: ' + (error.message || 'Error desconocido'), 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async obtenerNombresUbicacion(userData: any) {
    try {
      // TODO: Implementar endpoints para obtener nombres de ubicación
      // this.http.get(...)
      console.log('Obtener nombres de ubicación pendiente de implementación backend');
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
      // TODO: Implementar endpoint de cambio de contraseña
      // await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/change-password`, { password: nuevaContrasena }));
      console.warn('Backend endpoint for password change not implemented yet');
      this.presentToast('Simulación: Contraseña actualizada correctamente', 'success');
    } catch (error: any) {
      this.presentToast('Error en la solicitud: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async actualizarFotoPerfil() {
    // TODO: Implementar manejo de cámara e imagen sin Supabase Storage
    this.presentToast('Funcionalidad de cambio de foto pendiente de migración a Backend propio', 'warning');
  }

  async capturarFoto(source: CameraSource) {
    // TODO
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
