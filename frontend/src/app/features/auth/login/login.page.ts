import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonIcon, IonLabel, // IonItem from top import removed
  IonInput, IonButton, LoadingController, ToastController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cardOutline, lockClosedOutline, logInOutline, personAddOutline,
  close, arrowBack, arrowBackOutline, personOutline, arrowForwardOutline,
  eyeOutline, eyeOffOutline, fingerPrintOutline
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '../services/auth.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { WebAuthnUtil } from 'src/app/core/utils/webauthn.util';
import { Preferences } from '@capacitor/preferences';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonIcon, IonLabel, 
    IonInput, IonButton, RouterLink
  ]
})
export class LoginPage implements OnInit {
  private authService = inject(AuthService);
  private secureStorage = inject(SecureStorageService);

  // Signals for form state
  ci = signal<string>('');
  password = signal<string>('');
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private fingerprintAIO: FingerprintAIO
  ) {
    addIcons({
      cardOutline,
      lockClosedOutline,
      logInOutline,
      personAddOutline,
      close,
      arrowBack,
      arrowBackOutline,
      personOutline,
      arrowForwardOutline,
      eyeOutline,
      eyeOffOutline,
      fingerPrintOutline
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    // Limpiamos inmediatamente
    this.ci.set('');
    this.password.set('');

    // Refuerzo: Limpiamos otra vez tras medio segundo para "nukear" el autocompletado del celular
    setTimeout(() => {
      this.ci.set('');
      this.password.set('');
    }, 500);

    this.checkBiometricLogin();
  }

  async checkBiometricLogin() {
    try {
      const isActive = await this.secureStorage.get('biometria_activada');
      // Si la biometría está activa, simplemente disparamos el proceso manual 
      // para que el usuario decida si usarla o escribir, pero sin dejar la clave expuesta.
      if (isActive === 'true') {
         // Opcional: Podrías disparar el trigger directamente aquí si quieres auto-login
      }
    } catch (e) {
      console.error('Error al detectar biometría', e);
    }
  }

  async triggerManualBiometricLogin() {
    const isActive = await this.secureStorage.get('biometria_activada');

    if (isActive === 'true') {
        await this.loginWithBiometrics();
    } else {
        this.presentToast('La biometría no está configurada, inicie sesión y configúrela en su perfil.', 'warning');
    }
  }

  async loginWithBiometrics() {
    try {
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
          // Exigimos BIOMETRÍA FUERTE (Hardware dedicado, no PIN/Patrón)
          const result = await this.fingerprintAIO.isAvailable({ requireStrongBiometrics: true });
          if (result !== 'biometric' && result !== 'finger' && result !== 'face') {
             this.presentToast('Este modo requiere un sensor de huella o rostro configurado', 'warning');
             return;
          }
          
          await this.fingerprintAIO.show({
              title: 'Autenticación Reforzada',
              subtitle: 'Verifique su identidad para acceder',
              description: 'El sistema requiere su huella o rostro para descifrar sus credenciales protegidas.',
              disableBackup: true, // No permitimos usar el PIN del teléfono como respaldo
          });
      } else {
          const credentialId = await this.secureStorage.get('bio_credential_id');
          if (!credentialId) {
             throw new Error("No hay credencial biométrica guardada.");
          }
          const success = await WebAuthnUtil.verifyBiometric(credentialId);
          if (!success) return; 
      }

      // --- ÉXITO BIOMÉTRICO (Solo llegamos aquí si el usuario pasó la huella/rostro) ---
      
      const ci = await this.secureStorage.get('bio_ci');
      const token = await this.secureStorage.get('bio_token');
      const pwdLegacy = await this.secureStorage.get('bio_pwd'); // Respaldo para transición

      if (ci && (token || pwdLegacy)) {
          const loading = await this.loadingController.create({
            message: 'Iniciando sesión segura...',
            spinner: 'crescent'
          });
          await loading.present();

          const loginObservable = token 
            ? this.authService.loginBiometric(ci, token)
            : this.authService.login(ci, pwdLegacy!);

          loginObservable.subscribe({
            next: async (response) => {
              await loading.dismiss();
              if (response.success) {
                this.presentToast('Bienvenido, acceso biometrico exitoso', 'success');
                this.router.navigate(['/home']);
              } else {
                this.presentToast('Error en la sesión biométrica', 'danger');
              }
            },
            error: async () => {
              await loading.dismiss();
              this.presentToast('Error de conexión con el servidor', 'danger');
            }
          });
      } else {
          this.presentToast('Por favor, inicie sesión con su contraseña una vez para activar la biometría reforzada.', 'warning');
      }

    } catch (e) {
      console.error('Autenticación biométrica fallida o cancelada.', e);
    }
  }

  togglePassword() {
    this.showPassword.update(value => !value);
  }

  async loginUser() {
    const ciValue = this.ci();
    const passwordValue = this.password();

    // Validar que los campos no estén vacíos
    if (!ciValue || !passwordValue) {
      this.presentToast('Por favor, complete todos los campos', 'warning');
      return;
    }

    // Validar formato de cédula (básico)
    if (ciValue.length !== 10) {
      this.presentToast('La cédula debe tener 10 dígitos', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();
    this.isLoading.set(true);

    this.authService.login(ciValue, passwordValue).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading.set(false);

        if (response.success && response.data) {
          // Update user session data immediately (AuthService handles state)
          this.presentToast('Sesión iniciada correctamente', 'success');
          // Redirect to Home Page (Unified Dashboard) for all users
          this.router.navigate(['/home']);
        } else {
          this.presentToast(response.message || 'Error al iniciar sesión', 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading.set(false);
        console.error('[LOGIN_PAGE] Login error:', error);

        let msg = 'Ocurrió un error al intentar iniciar sesión.';

        if (error.status === 0) {
          msg = 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.';
        } else if (error.status === 401 || error.status === 403) {
          msg = error.error?.message || 'Cédula o contraseña incorrectos. Verifique sus datos.';
          // Si el backend envía "Credenciales inválidas", lo ponemos un poco más amigable:
          if (msg === 'Credenciales inválidas') {
            msg = 'Cédula o contraseña incorrectos. Verifique sus datos.';
          }
        } else if (error.error && error.error.message) {
          msg = error.error.message;
        }

        this.presentToast(msg, 'danger');
      }
    });
  }

  // Deprecated redirect method removed in favor of direct navigation to /home
  redirigirUsuario(rolId: number) {
    this.router.navigate(['/home']);
  }

  iraRegister() {
    this.router.navigate(['/register']);
  }

  solicitarRecuperacion() {
    this.router.navigate(['/recuperar-password']);
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

  // Helper methods for two-way binding with signals
  updateCi(event: any) {
    this.ci.set(event.target.value);
  }

  updatePassword(event: any) {
    this.password.set(event.target.value);
  }
}
