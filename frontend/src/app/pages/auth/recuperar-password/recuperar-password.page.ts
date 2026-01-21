import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController, AlertController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RecuperarPasswordPage implements OnInit {
  email: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  paso: 'email' | 'resetear' | 'exito' = 'email';
  enviando: boolean = false;
  token: string | null = null;
  siteURL: string = '';

  private authService = inject(AuthService);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private platform: Platform
  ) { }

  ngOnInit() {
    // Determinar la URL base para redirección
    this.siteURL = window.location.origin;

    // Verificar si hay un token de recuperación en la URL
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'recovery' && params['token']) {
        this.token = params['token'];
        this.paso = 'resetear';
      }
    });

    // Verificar si hay una sesión asociada con el token en la URL
    // this.verificarSesion(); // Ya no es necesario con custom backend, token en URL es suficiente
  }

  // Métodos para validación de contraseña
  hasUpperCase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  hasLowerCase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  hasDigit(password: string): boolean {
    return /\d/.test(password);
  }

  async solicitarRecuperacion() {
    // Validaciones iniciales
    if (!this.email) {
      this.presentToast('Por favor ingrese su correo electrónico', 'warning');
      return;
    }

    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Procesando solicitud...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const redirectTo = environment.redirectUrl;

      console.log('Enviando solicitud de recuperación a:', this.email);

      this.authService.requestPasswordReset(this.email, redirectTo).subscribe({
        next: (response) => {
          loading.dismiss();
          this.enviando = false;
          this.presentAlerta(
            '¡Solicitud procesada!',
            'Si el correo existe en nuestro sistema, recibirá un enlace de recuperación. Por favor revise su bandeja de entrada y carpeta de spam.'
          );
        },
        error: (error) => {
          loading.dismiss();
          this.enviando = false;
          console.error('Error al solicitar recuperación:', error);
          this.presentToast('Error al enviar solicitud (API no implementada)', 'danger');
        }
      });

    } catch (error: any) {
      loading.dismiss();
      this.enviando = false;
      console.error('Error completo:', error);
      this.presentToast('Error al procesar la solicitud: ' + (error.message || 'Error desconocido'), 'danger');
    }
  }

  async actualizarContrasena() {
    // Validaciones de los campos
    if (!this.nuevaContrasena || !this.confirmarContrasena) {
      this.presentToast('Por favor, complete todos los campos', 'warning');
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.presentToast('Las contraseñas no coinciden', 'danger');
      return;
    }

    if (this.nuevaContrasena.length < 8) {
      this.presentToast('La contraseña debe tener al menos 8 caracteres', 'warning');
      return;
    }

    // Validar que la contraseña tenga al menos una letra mayúscula, una minúscula y un número
    const contrasenaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!contrasenaRegex.test(this.nuevaContrasena)) {
      this.presentToast('La contraseña debe contener al menos una letra mayúscula, una minúscula y un número', 'warning');
      return;
    }

    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Actualizando contraseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Actualizar la contraseña del usuario autenticado
      // En un flujo real de recuperación por token, el token vendría en la URL y se usaría para autorizar
      // Aquí asumimos que authService manejaría eso o que el usuario ya 'inicio sesión' con el token

      this.authService.updatePassword(this.nuevaContrasena).subscribe({
        next: () => {
          loading.dismiss();
          this.enviando = false;
          this.paso = 'exito';
          this.presentToast('¡Contraseña actualizada exitosamente!', 'success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          loading.dismiss();
          this.enviando = false;
          console.error('Error al actualizar:', error);
          this.presentToast('Error al actualizar contraseña (API no implementada)', 'danger');
        }
      });

    } catch (error: any) {
      loading.dismiss();
      this.enviando = false;
      console.error('Error completo:', error);
      this.presentToast('Error al procesar la solicitud: ' + error.message, 'danger');
    }
  }

  volverAlLogin() {
    this.router.navigate(['/login']);
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

  async presentAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }
}

