import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ToastController, ActionSheetController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
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

  ngOnInit() { }

  ionViewWillEnter() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando = true;
    this.datosUsuario = null;

    // Usamos /api/users/me: accesible por cualquier usuario autenticado (no requiere admin)
    const url = `${environment.apiUrl}/users/me`;

    this.http.get<any>(url).pipe(
      timeout(10000),
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (usuario: any) => {
        if (!usuario) {
          this.presentToast('No se encontraron datos del usuario', 'warning');
          return;
        }

        // Construir nombre completo
        const nombreCompleto = [
          usuario.primerNombre,
          usuario.segundoNombre,
          usuario.primerApellido,
          usuario.segundoApellido
        ].filter(Boolean).join(' ') || usuario.nombre || '';

        const apellido = [
          usuario.primerApellido,
          usuario.segundoApellido
        ].filter(Boolean).join(' ');

        this.datosUsuario = {
          ...usuario,
          // Campos normalizados para la vista
          Nombre_Usuario: [usuario.primerNombre, usuario.segundoNombre].filter(Boolean).join(' ') || usuario.nombre,
          apellido: apellido,
          nombreCompleto: nombreCompleto,
          CI_Usuario: usuario.ci,
          Celular_Usuario: usuario.celular || usuario.telefono,
          Rol_Usuario: usuario.rol?.nombre || 'Usuario',
          Imagen_Perfil: usuario.fotoPerfilUrl,
          Firma_Usuario: usuario.firmaUrl,
          // Ubicación desde objetos anidados del backend
          Provincia_Nombre: usuario.provincia?.nombre || '',
          Canton_Nombre: usuario.canton?.nombre || '',
          Fecha_Nacimiento: usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento).toISOString().split('T')[0] : null,
        };

        this.provinciaUsuario = this.datosUsuario.Provincia_Nombre;
        this.cantonUsuario = this.datosUsuario.Canton_Nombre;
        this.parroquiaUsuario = usuario.parroquia?.nombre || '';

        // Estadísticas del _count que devuelve el backend
        this.capacitacionesInscritas = usuario._count?.inscripciones ?? 0;
        this.certificadosObtenidos = usuario._count?.certificados ?? 0;
      },
      error: (err) => {
        console.error('[PERFIL] Error al cargar:', err);
        const msg = err.error?.message || err.message || 'Error de conexión';
        this.presentToast('Error al cargar perfil: ' + msg, 'danger');
      }
    });
  }

  obtenerRolTexto(rol: any): string {
    if (typeof rol === 'string') return rol;
    return rol?.nombre || 'Usuario';
  }

  async editarPerfil() {
    try {
      this.router.navigate(['/ver-perfil/editar'], {
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
      this.router.navigate(['/ver-perfil/firma'], {
        state: { usuario: this.datosUsuario }
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
        { name: 'nuevaContrasena', type: 'password', placeholder: 'Nueva contraseña (mín. 6 caracteres)' },
        { name: 'confirmarContrasena', type: 'password', placeholder: 'Confirmar nueva contraseña' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cambiar',
          handler: async (data) => {
            if (!data.nuevaContrasena || data.nuevaContrasena.length < 6) {
              this.presentToast('La contraseña debe tener al menos 6 caracteres', 'warning');
              return false;
            }
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
    const loading = await this.loadingController.create({ message: 'Actualizando contraseña...', spinner: 'crescent' });
    await loading.present();
    try {
      // Usa PUT /api/users/me que no requiere ser admin
      await firstValueFrom(this.http.put(`${environment.apiUrl}/users/me`, { password: nuevaContrasena }));
      this.presentToast('Contraseña actualizada correctamente', 'success');
    } catch (error: any) {
      const msg = error.error?.message || error.message || 'Error desconocido';
      this.presentToast('Error al actualizar: ' + msg, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async actualizarFotoPerfil() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Actualizar foto de perfil',
      buttons: [
        { text: 'Cámara', icon: 'camera', handler: () => { this.capturarFoto(CameraSource.Camera); } },
        { text: 'Galería', icon: 'image', handler: () => { this.capturarFoto(CameraSource.Photos); } },
        { text: 'Cancelar', icon: 'close', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async capturarFoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source
      });
      if (image.base64String) {
        await this.subirFoto(image.base64String, image.format);
      }
    } catch (error: any) {
      if (error?.message !== 'User cancelled photos app') {
        console.error('[PERFIL] Error capturando foto:', error);
      }
    }
  }

  async subirFoto(base64: string, format: string = 'jpeg') {
    const loading = await this.loadingController.create({ message: 'Subiendo imagen...', spinner: 'crescent' });
    await loading.present();
    try {
      const fotoUrl = `data:image/${format};base64,${base64}`;
      await firstValueFrom(this.http.put(`${environment.apiUrl}/users/me`, { fotoPerfilUrl: fotoUrl }));
      this.datosUsuario.Imagen_Perfil = fotoUrl;
      this.presentToast('Foto de perfil actualizada', 'success');
      this.cdr.detectChanges();
    } catch (error: any) {
      const msg = error.error?.message || error.message || 'Error';
      this.presentToast('Error al subir imagen: ' + msg, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async cerrarSesion() {
    const loading = await this.loadingController.create({ message: 'Cerrando sesión...', spinner: 'crescent' });
    await loading.present();
    try {
      this.authService.clearAuthData();
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.presentToast('Error: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [{ side: 'end', icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
