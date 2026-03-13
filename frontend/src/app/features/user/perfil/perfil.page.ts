import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ToastController, ActionSheetController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom, timeout, finalize } from 'rxjs';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { Preferences } from '@capacitor/preferences';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { WebAuthnUtil } from 'src/app/core/utils/webauthn.util';

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
  biometriaActiva: boolean = false;
  // Recompensas / Logros
  logros: any[] = [];

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private navController: NavController,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fingerprintAIO: FingerprintAIO
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.cargarPerfil();
    this.verificarBiometria();
  }

  async verificarBiometria() {
    try {
      const { value } = await Preferences.get({ key: 'biometria_activada' });
      this.biometriaActiva = value === 'true';
    } catch (e) {
      console.error('Error al verificar biometría:', e);
    }
  }

  verificarDisponibilidadBiometria() {
     // Stub in case checking state logic needs expansion later
  }

  async toggleBiometria(event: any) {
    const isChecked = event.detail.checked;
    
    // Si el usuario lo está activando
    if (isChecked) {
      try {
        const isNative = Capacitor.isNativePlatform();
        let isBiometricAvailable = false;

        if (isNative) {
           const result = await this.fingerprintAIO.isAvailable({ requireStrongBiometrics: false });
           isBiometricAvailable = (result === 'biometric' || result === 'finger' || result === 'face');
        } else {
           isBiometricAvailable = await WebAuthnUtil.isAvailable();
        }

        this.calcularLogros();

        if (!isBiometricAvailable) {
           this.presentToast('Biometría no disponible en este dispositivo.', 'warning');
           this.biometriaActiva = false;
           return;
        }

        const alert = await this.alertController.create({
          header: 'Activar Biometría',
          message: 'Para activar el inicio de sesión con FaceID/Huella, ingrese su contraseña actual.',
          inputs: [
            { name: 'password', type: 'password', placeholder: 'Contraseña' }
          ],
          buttons: [
            { 
              text: 'Cancelar', 
              role: 'cancel',
              handler: () => {
                this.biometriaActiva = false;
              }
            },
            {
              text: 'Verificar y Activar',
              handler: async (data) => {
                const pass = data.password;
                if (!pass) return false;
                
                const ci = this.datosUsuario.CI_Usuario;
                const loading = await this.loadingController.create({ message: 'Verificando...' });
                await loading.present();

                try {
                  // Verificamos si la contraseña es correcta haciendo un login en background
                  const loginResponse = await firstValueFrom(this.authService.login(ci, pass));
                  await loading.dismiss();

                  if (loginResponse.success) {
                      if (isNative) {
                          // Solicitar la huella o rostro para confirmar propiedad en móvil
                          await this.fingerprintAIO.show({
                             title: 'Confirmar Seguridad',
                             subtitle: 'Active la biometría usando su dispositivo',
                             description: 'Escanee su huella o rostro para completar el registro',
                             disableBackup: true
                          });
                      } else {
                          // Crear la credencial WebAuthn
                          const credentialId = await WebAuthnUtil.registerBiometric(this.datosUsuario.Nombre_Usuario);
                          await Preferences.set({ key: 'bio_credential_id', value: credentialId });
                      }

                      // Guardar credenciales de forma segura
                      await Preferences.set({ key: 'biometria_activada', value: 'true' });
                      await Preferences.set({ key: 'bio_ci', value: ci });
                      await Preferences.set({ key: 'bio_pwd', value: pass });

                      this.presentToast('Biometría configurada correctamente', 'success');
                      this.biometriaActiva = true;
                  } else {
                     this.presentToast('Contraseña incorrecta', 'danger');
                     this.biometriaActiva = false;
                  }
                } catch (e) {
                  await loading.dismiss();
                  this.presentToast('Error al verificar las credenciales', 'danger');
                  this.biometriaActiva = false;
                }
                return true;
              }
            }
          ]
        });
        await alert.present();

      } catch (error) {
        console.error('Biometría error:', error);
        this.presentToast('No se pudo usar la biometría del dispositivo', 'danger');
        this.biometriaActiva = false;
      }
    } else {
      // Si la está desactivando
      await Preferences.remove({ key: 'biometria_activada' });
      await Preferences.remove({ key: 'bio_ci' });
      await Preferences.remove({ key: 'bio_pwd' });
      await Preferences.remove({ key: 'bio_credential_id' });
      this.biometriaActiva = false;
      this.presentToast('Biometría desactivada.', 'secondary');
    }
  }

  cargarPerfil() {
    this.cargando = true;
    this.datosUsuario = null;

    // Usamos /api/users/me: accesible por cualquier usuario autenticado (no requiere admin)
    const url = `${environment.apiUrl}/users/me`;

    this.http.get<any>(url).pipe(
      timeout(10000),
      finalize(() => {
        this.calcularLogros(); // Se calculan los logros al final de recargar
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

  // ==== SISTEMA DE LOGROS ====
  calcularLogros() {
    this.logros = [];

    // Logro por Asistencia (Participante)
    if (this.capacitacionesInscritas > 0) {
      if (this.capacitacionesInscritas >= 5) {
         this.logros.push({
           icon: 'school',
           color: 'warning',
           title: 'Estudiante Dedicado',
           description: 'Te has inscrito en 5 o más capacitaciones.',
           level: 'Oro'
         });
      } else {
         this.logros.push({
           icon: 'book',
           color: 'primary',
           title: 'Aprendiz',
           description: 'Te has inscrito en al menos una capacitación.',
           level: 'Bronce'
         });
      }
    }

    // Logro por Certificados
    if (this.certificadosObtenidos > 0) {
      if (this.certificadosObtenidos >= 3) {
         this.logros.push({
           icon: 'medal',
           color: 'warning',
           title: 'Experto Certificado',
           description: 'Has obtenido 3 o más certificados.',
           level: 'Oro'
         });
      } else {
         this.logros.push({
           icon: 'ribbon',
           color: 'secondary',
           title: 'Primer Certificado',
           description: 'Has obtenido tu primer certificado.',
           level: 'Plata'
         });
      }
    }

    // Logro por Perfil Completo
    if (this.datosUsuario && (this.datosUsuario.firmaUrl || this.datosUsuario.Firma_Usuario)) {
      this.logros.push({
        icon: 'shield-checkmark',
        color: 'success',
        title: 'Perfil Verificado',
        description: 'Has configurado tu firma digital.',
        level: 'Plata'
      });
    }

    // Si aún no tiene logros
    if (this.logros.length === 0) {
      this.logros.push({
        icon: 'footsteps',
        color: 'medium',
        title: 'Primeros Pasos',
        description: 'Comienza a participar en capacitaciones para ganar logros.',
        level: 'Inicio'
      });
    }
  }
}
