import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, 
  IonMenuButton, IonBackButton, IonContent, IonSpinner, IonIcon, 
  IonAvatar, IonToggle, IonModal, IonInput,
  AlertController, LoadingController, ToastController, 
  ActionSheetController, NavController 
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { addIcons } from 'ionicons';
import { 
  settingsOutline, camera, shieldCheckmark, checkmarkCircle, 
  closeCircle, personOutline, idCardOutline, mailOutline, 
  callOutline, homeOutline, fingerPrintOutline, createOutline, 
  lockClosedOutline, brushOutline, cloudOfflineOutline, 
  school, book, medal, ribbon, footsteps, close, image, 
  shieldCheckmarkOutline, arrowForwardCircle, chevronForward, 
  statsChart, addCircleOutline, brush, trash, personCircle
} from 'ionicons/icons';

import { firstValueFrom, timeout, finalize } from 'rxjs';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { WebAuthnUtil } from 'src/app/core/utils/webauthn.util';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, 
    IonMenuButton, IonBackButton, IonContent, IonSpinner, IonIcon, 
    IonAvatar, IonToggle, IonModal, IonInput
  ]
})
export class PerfilPage implements OnInit {
  datosUsuario: any = null;
  cargando: boolean = true;
  capacitacionesInscritas: number = 0;
  certificadosObtenidos: number = 0;
  provinciaUsuario: string = '';
  cantonUsuario: string = '';
  parroquiaUsuario: string = '';
  platformLabel: string = 'Biometría';
  platformIcon: string = 'finger-print-outline';
  biometriaActiva: boolean = false;
  
  // Biometric Verification Modal state
  mostrarModalBio: boolean = false;
  passVerificacion: string = '';
  verificandoBio: boolean = false;
  verPassword: boolean = false;
  activacionExitosa: boolean = false;
  toggleEventActual: any = null;



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
    private fingerprintAIO: FingerprintAIO,
    private secureStorage: SecureStorageService
  ) {
    addIcons({
      settingsOutline, camera, shieldCheckmark, checkmarkCircle, 
      closeCircle, personOutline, idCardOutline, mailOutline, 
      callOutline, homeOutline, fingerPrintOutline, createOutline, 
      lockClosedOutline, brushOutline, cloudOfflineOutline, 
      school, book, medal, ribbon, footsteps, close, image, 
      shieldCheckmarkOutline, arrowForwardCircle, chevronForward, 
      statsChart, addCircleOutline, brush, 
      'trash': trash,
      'person-circle': personCircle,

      'settings-outline': settingsOutline,
      'create-outline': createOutline, 'lock-closed-outline': lockClosedOutline,
      'brush-outline': brushOutline, 'shield-checkmark': shieldCheckmark,
      'checkmark-circle': checkmarkCircle, 'close-circle': closeCircle,
      'person-outline': personOutline, 'id-card-outline': idCardOutline,
      'mail-outline': mailOutline, 'call-outline': callOutline,
      'home-outline': homeOutline, 'finger-print-outline': fingerPrintOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'cloud-offline-outline': cloudOfflineOutline, 'stats-chart': statsChart,
      'arrow-forward-circle': arrowForwardCircle, 'chevron-forward': chevronForward,
      'finger-print': fingerPrintOutline
    });




  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.cargarPerfil();
    this.verificarBiometria();
  }

  async verificarBiometria() {
    this.platformLabel = WebAuthnUtil.getPlatformLabel();
    
    // Choose icon based on label
    if (this.platformLabel.includes('Windows')) this.platformIcon = 'shield-checkmark-outline';
    else if (this.platformLabel.includes('Android')) this.platformIcon = 'finger-print-outline';
    else if (this.platformLabel.includes('Face ID')) this.platformIcon = 'person-outline';
    else this.platformIcon = 'finger-print-outline';

    try {
      const value = await this.secureStorage.get('biometria_activada');
      this.biometriaActiva = value === 'true';
    } catch (e) {
      console.error('Error al verificar biometría:', e);
    }
  }

  async toggleBiometria(event: any) {
    const isChecked = event.detail.checked;
    
    // Evitamos bucles si el cambio fue provocado por nosotros mismos al resetear el toggle
    if (isChecked === this.biometriaActiva) return;

    // REGLA DE ORO: Si no hay datos de usuario, no podemos activar biometría (necesitamos el CI)
    if (!this.datosUsuario) {
      const errAlert = await this.alertController.create({
        header: 'Perfil no cargado',
        message: 'Por favor, espera a que tus datos de perfil se carguen completamente antes de configurar la biometría.',
        buttons: ['OK']
      });
      await errAlert.present();
      setTimeout(() => {
        if (event.target) event.target.checked = false;
        this.cdr.detectChanges();
      }, 100);
      return;
    }

    // Feedback inmediato: Mostramos un loading ligero para que el usuario sepa que algo pasa
    const loading = await this.loadingController.create({
      message: 'Verificando hardware...',
      duration: 5000 // Aumentamos un poco el safe timeout del spinner
    });
    await loading.present();

    try {
      // Caso 1: DESACTIVAR
      if (this.biometriaActiva) {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Desactivar Biometría',
            message: '¿Estás seguro de que deseas desactivar el acceso biométrico?',
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                  setTimeout(() => {
                    if (event.target) event.target.checked = true;
                    this.cdr.detectChanges();
                  }, 100);
                }
              },
              {
                text: 'Desactivar',
                cssClass: 'danger',
                handler: async () => {
                  await this.secureStorage.set('biometria_activada', 'false');
                  await this.secureStorage.remove('bio_token');
                  await this.secureStorage.remove('bio_ci');
                  await this.secureStorage.remove('bio_credential_id');
                  this.biometriaActiva = false;
                  this.presentToast('Biometría desactivada correctamente', 'secondary');
                }
              }
            ]
          });
          await alert.present();
          return;
      }

      // Caso 2: ACTIVAR
      const isNative = Capacitor.isNativePlatform();
      
      // Timeout manual drástico para evitar que la UI se "congele" sin mensaje
      const checkPromise = isNative 
        ? this.fingerprintAIO.isAvailable({ requireStrongBiometrics: false })
        : WebAuthnUtil.isAvailable();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT_HARDWARE')), 3000)
      );

      const result = await Promise.race([checkPromise, timeoutPromise]);
      let isBiometricAvailable = false;

      if (isNative) {
         isBiometricAvailable = (result === 'biometric' || result === 'finger' || result === 'face');
      } else {
         isBiometricAvailable = !!result;
      }

      await loading.dismiss();

      if (!isBiometricAvailable) {
         const noAioAlert = await this.alertController.create({
           header: 'Biometría no disponible',
           message: 'Tu dispositivo o navegador no soporta autenticación biométrica segura en este momento.',
           buttons: ['OK']
         });
         await noAioAlert.present();
         
         setTimeout(() => {
            if (event.target) event.target.checked = false;
            this.cdr.detectChanges();
         }, 100);
         return;
      }

      // TODO OK: Mostramos el modal premium
      this.toggleEventActual = event;
      this.mostrarModalBio = true;
      this.passVerificacion = '';
      this.verPassword = false;
      this.activacionExitosa = false;
      
      // Forzamos actualización para asegurar que el modal se "dispare" inmediatamente
      this.cdr.detectChanges();

    } catch (error: any) {
      if (loading) await loading.dismiss();
      console.error('Error toggle biometria:', error);
      
      let msg = 'El sensor biométrico no respondió. Inténtalo de nuevo o reinicia la app.';
      if (error.message !== 'TIMEOUT_HARDWARE') msg = 'Error de hardware: ' + (error.message || 'Desconocido');
      
      const errAlert = await this.alertController.create({
        header: 'Aviso de Seguridad',
        message: msg,
        buttons: ['OK']
      });
      await errAlert.present();

      setTimeout(() => {
        if (event.target) event.target.checked = false;
        this.cdr.detectChanges();
      }, 100);
    }
  }




  async confirmarActivacionBio() {
    if (!this.passVerificacion) {
       this.presentToast('Por favor ingrese su contraseña', 'warning');
       return;
    }
    
    this.verificandoBio = true;
    const ci = this.datosUsuario.CI_Usuario;
    const isNative = Capacitor.isNativePlatform();

    try {
      const loginResponse = await firstValueFrom(this.authService.login(ci, this.passVerificacion));

      if (loginResponse.success) {
          if (isNative) {
              await this.fingerprintAIO.show({
                 title: 'Confirmar Seguridad',
                 subtitle: 'Active la biometría usando su dispositivo',
                 description: 'Escanee su huella o rostro para completar el registro',
                 disableBackup: true
              });
          } else {
              const credentialId = await WebAuthnUtil.registerBiometric(this.datosUsuario.Nombre_Usuario);
              await this.secureStorage.set('bio_credential_id', credentialId);
          }

          const setupResponse = await firstValueFrom(this.authService.setupBiometric());
          
          if (setupResponse.success && setupResponse.data.biometricToken) {
              await this.secureStorage.set('biometria_activada', 'true');
              await this.secureStorage.set('bio_ci', ci);
              await this.secureStorage.set('bio_token', setupResponse.data.biometricToken);
              
              // Estado de éxito visual en el modal
              this.activacionExitosa = true;
              this.biometriaActiva = true;
              this.calcularLogros();

              // Esperamos un momento para que el usuario vea el éxito antes de cerrar
              setTimeout(() => {
                this.mostrarModalBio = false;
                this.activacionExitosa = false;
                this.cdr.detectChanges();
                
                // Mostramos el toast después de que el modal empiece a cerrarse
                setTimeout(() => {
                  this.presentToast('Biometría activada correctamente', 'success');
                }, 400);
              }, 1500);

          } else {
              throw new Error('No se pudo generar el token biométrico');
          }
      } else {
          this.presentToast('Contraseña incorrecta. Verifique sus datos.', 'danger');
      }
    } catch (e: any) {
      console.error('Error en activación Bio:', e);
      this.presentToast('No se pudo completar la activación: ' + (e.message || 'Error de hardware'), 'danger');
    } finally {
      this.verificandoBio = false;
    }
  }

  cerrarModalBio() {
    this.mostrarModalBio = false;
    // Si cerramos el modal sin éxito, revertimos el toggle de forma persistente
    if (!this.biometriaActiva && this.toggleEventActual) {
        // Usamos un delay un poco mayor para asegurar que la animación del modal 
        // no interfiera con el ciclo de vida de detección de cambios
        setTimeout(() => {
            if (this.toggleEventActual.target) {
                this.toggleEventActual.target.checked = false;
            }
            this.biometriaActiva = false;
            this.cdr.detectChanges();
            this.toggleEventActual = null;
        }, 150);
    } else {
        this.toggleEventActual = null;
    }
  }


  cargarPerfil() {
    this.cargando = true;
    this.datosUsuario = null;
    const url = `${environment.apiUrl}/users/me`;

    this.http.get<any>(url).pipe(
      timeout(10000),
      finalize(() => {
        this.calcularLogros();
        this.cargando = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (usuario: any) => {
        if (!usuario) {
          this.presentToast('No se encontraron datos del usuario', 'warning');
          return;
        }

        const cleanPart = (val: any) => (val || '').toString().replace(/\bnull\b/g, '').trim();

        const nombreCompleto = [
          cleanPart(usuario.primerNombre),
          cleanPart(usuario.segundoNombre),
          cleanPart(usuario.primerApellido),
          cleanPart(usuario.segundoApellido)
        ].filter(p => !!p).join(' ') || (usuario.nombre || '').replace(/\s*null\s*/g, ' ').trim() || '';

        const apellido = [
          usuario.primerApellido,
          usuario.segundoApellido
        ].filter(Boolean).join(' ');

        this.datosUsuario = {
          ...usuario,
          Nombre_Usuario: [usuario.primerNombre, usuario.segundoNombre].filter(Boolean).join(' ') || usuario.nombre,
          apellido: apellido,
          nombreCompleto: nombreCompleto,
          CI_Usuario: usuario.ci,
          Celular_Usuario: usuario.celular || usuario.telefono,
          Rol_Usuario: usuario.rol?.nombre || 'Usuario',
          Imagen_Perfil: usuario.fotoPerfilUrl,
          Firma_Usuario: usuario.firmaUrl,
          Provincia_Nombre: usuario.provincia?.nombre || '',
          Canton_Nombre: usuario.canton?.nombre || '',
          Fecha_Nacimiento: usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento).toISOString().split('T')[0] : null,
        };

        this.provinciaUsuario = this.datosUsuario.Provincia_Nombre;
        this.cantonUsuario = this.datosUsuario.Canton_Nombre;
        this.parroquiaUsuario = usuario.parroquia?.nombre || '';

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

  /**
   * Obtiene la URL completa para una imagen de perfil o firma.
   * Maneja base64, URLs absolutas y rutas relativas del backend.
   */
  getImageUrl(path: string | null | undefined): string {
    if (!path) return 'assets/avatar-placeholder.svg';
    if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('assets/')) return path;

    
    // Si la ruta empieza con /, quitarlo para evitar dobles //
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // El backend sirve archivos desde public/, por lo que la URL base es el origen del API (sin /api)
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${cleanPath}`;
  }


  obtenerRolTexto(rol: any): string {
    if (typeof rol === 'string') return rol;
    return rol?.nombre || 'Usuario';
  }

  async editarPerfil() {
    this.router.navigate(['/ver-perfil/editar'], {
      state: { usuario: this.datosUsuario, modoFirma: false }
    });
  }

  async navegarAFirma() {
    this.router.navigate(['/ver-perfil/firma'], {
      state: { usuario: this.datosUsuario }
    });
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
      await firstValueFrom(this.http.put(`${environment.apiUrl}/users/me`, { password: nuevaContrasena }));
      this.presentToast('Contraseña actualizada correctamente', 'success');
    } catch (error: any) {
      const msg = error.error?.message || error.message || 'Error';
      this.presentToast('Error al actualizar: ' + msg, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async actualizarFotoPerfil() {
    const buttons: any[] = [
      { text: 'Cámara', icon: 'camera', handler: () => { this.capturarFoto(CameraSource.Camera); } },
      { text: 'Galería', icon: 'image', handler: () => { this.capturarFoto(CameraSource.Photos); } },
      { text: 'Elegir Avatar', icon: 'person-circle', handler: () => { this.abrirSelectorAvatars(); } }
    ];


    // Mostrar opción de eliminar si hay una foto actual
    if (this.datosUsuario?.Imagen_Perfil) {
      buttons.push({
        text: 'Eliminar foto',
        role: 'destructive',
        icon: 'trash',
        handler: () => { this.eliminarFoto(); }
      });
    }

    buttons.push({ text: 'Cancelar', icon: 'close', role: 'cancel' });

    const actionSheet = await this.actionSheetController.create({
      header: 'Actualizar foto de perfil',
      buttons: buttons
    });
    await actionSheet.present();
  }


  async capturarFoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true, // Habilitar edición para mejor encuadre
        resultType: CameraResultType.Base64,
        source: source,
        width: 800, // Limitar tamaño para eficiencia
        correctOrientation: true
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

  async eliminarFoto() {
    const loading = await this.loadingController.create({ message: 'Eliminando foto...', spinner: 'crescent' });
    await loading.present();
    try {
      await firstValueFrom(this.http.put(`${environment.apiUrl}/users/me`, { fotoPerfilUrl: null }));
      this.datosUsuario.Imagen_Perfil = null;
      this.presentToast('Foto de perfil eliminada', 'success');
      this.calcularLogros(); // Actualizar logros
      this.cdr.detectChanges();
    } catch (error: any) {

      const msg = error.error?.message || error.message || 'Error';
      this.presentToast('Error al eliminar foto: ' + msg, 'danger');
    } finally {
      loading.dismiss();
    }
  }


  async subirFoto(base64: string, format: string = 'jpeg') {
    const loading = await this.loadingController.create({ message: 'Subiendo imagen...', spinner: 'crescent' });
    await loading.present();
    try {
      const fotoUrl = `data:image/${format};base64,${base64}`;
      const response: any = await firstValueFrom(this.http.put(`${environment.apiUrl}/users/me`, { fotoPerfilUrl: fotoUrl }));
      
      if (response && response.fotoPerfilUrl) {
        this.datosUsuario.Imagen_Perfil = response.fotoPerfilUrl;
      } else {
        this.datosUsuario.Imagen_Perfil = fotoUrl; // Fallback a base64 local
      }
      
      this.presentToast('Foto de perfil actualizada', 'success');
      this.calcularLogros(); // Recalcular logros al cambiar foto
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

  calcularLogros() {
    this.logros = [];
    
    // 1. Logros por Capacitaciones (Cursos)
    if (this.capacitacionesInscritas > 0) {
      if (this.capacitacionesInscritas >= 10) {
        this.logros.push({ icon: 'school', color: 'tertiary', title: 'Maestro del Saber', description: '10 o más capacitaciones inscritas.', level: 'Diamante' });
      } else if (this.capacitacionesInscritas >= 5) {
        this.logros.push({ icon: 'school', color: 'warning', title: 'Estudiante Dedicado', description: '5 o más capacitaciones.', level: 'Oro' });
      } else {
        this.logros.push({ icon: 'book', color: 'primary', title: 'Aprendiz', description: 'Al menos una capacitación.', level: 'Bronce' });
      }
    }

    // 2. Logros por Certificados
    if (this.certificadosObtenidos > 0) {
      if (this.certificadosObtenidos >= 5) {
        this.logros.push({ icon: 'medal', color: 'tertiary', title: 'Leyenda Certificada', description: '5 o más certificados obtenidos.', level: 'Diamante' });
      } else if (this.certificadosObtenidos >= 3) {
        this.logros.push({ icon: 'medal', color: 'warning', title: 'Experto Certificado', description: '3 o más certificados.', level: 'Oro' });
      } else {
        this.logros.push({ icon: 'ribbon', color: 'secondary', title: 'Primer Certificado', description: 'Has obtenido tu primer certificado.', level: 'Plata' });
      }
    }

    // 3. Logros por Perfil y Seguridad
    if (this.datosUsuario) {
      // Firma y Foto
      const tieneFirma = !!(this.datosUsuario.firmaUrl || this.datosUsuario.Firma_Usuario);
      const tieneFoto = this.datosUsuario.Imagen_Perfil && !this.datosUsuario.Imagen_Perfil.includes('placeholder');
      
      if (tieneFirma && tieneFoto) {
        this.logros.push({ icon: 'shield-checkmark', color: 'warning', title: 'Perfil Élite', description: 'Identidad digital completa y verificada.', level: 'Oro' });
      } else if (tieneFirma) {
        this.logros.push({ icon: 'shield-checkmark', color: 'success', title: 'Perfil Verificado', description: 'Firma digital configurada.', level: 'Plata' });
      }

      // Biometría
      if (this.biometriaActiva) {
        this.logros.push({ icon: 'finger-print', color: 'tertiary', title: 'Guardián Digital', description: 'Acceso seguro mediante biometría activo.', level: 'Especial' });
      }

      // Completitud de Perfil (campos básicos)
      const camposCompletos = [
        this.datosUsuario.email,
        this.datosUsuario.Celular_Usuario,
        this.datosUsuario.Provincia_Nombre,
        this.datosUsuario.Canton_Nombre,
        this.datosUsuario.direccion
      ].filter(Boolean).length;

      if (camposCompletos >= 5) {
        this.logros.push({ icon: 'person-circle', color: 'success', title: 'Ciudadano Ejemplar', description: 'Perfil con información completa.', level: 'Plata' });
      }
    }

    // 4. Logro por defecto si no tiene nada
    if (this.logros.length === 0) {
      this.logros.push({ icon: 'footsteps', color: 'medium', title: 'Primeros Pasos', description: 'Explora la plataforma para ganar logros.', level: 'Inicio' });
    }
  }
  // Avatares predefinidos (usando Dicebear para máxima fiabilidad y calidad SVG)
  avatarsPredefinidos = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=ElectroBot1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/identicon/svg?seed=TechFocus',
    'https://api.dicebear.com/7.x/bottts/svg?seed=KittyRobot&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/shapes/svg?seed=EcoSphere&backgroundColor=c0aede'
  ];

  mostrarModalAvatars = false;

  abrirSelectorAvatars() {
    this.mostrarModalAvatars = true;
    this.cdr.detectChanges();
  }

  async seleccionarAvatarPredefinido(path: string) {
    this.mostrarModalAvatars = false;
    const loading = await this.loadingController.create({ message: 'Actualizando avatar...', spinner: 'crescent' });
    await loading.present();
    try {
      await firstValueFrom(this.http.put(`${environment.apiUrl}/users/me`, { fotoPerfilUrl: path }));
      this.datosUsuario.Imagen_Perfil = path;
      this.presentToast('Avatar actualizado', 'success');
      this.calcularLogros();
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error al actualizar avatar:', error);
      this.presentToast('Error al actualizar avatar', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Final del archivo
}

