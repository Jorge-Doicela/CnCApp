import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController, AlertController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
  standalone: false
})
export class RecuperarPasswordPage implements OnInit {
  email: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  paso: 'email' | 'resetear' | 'exito' = 'email';
  enviando: boolean = false;
  token: string | null = null;
  siteURL: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private platform: Platform
  ) {}

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
    this.verificarSesion();
  }

  async verificarSesion() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && this.token) {
        console.log('Sesión activa detectada');
        this.paso = 'resetear';
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
    }
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
    // Validaciones iniciales (mantén el código existente)

    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Procesando solicitud...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const redirectTo = environment.redirectUrl;

      console.log('Enviando solicitud de recuperación a:', this.email);
      console.log('URL de redirección:', redirectTo);

      // Modificación para capturar más información del error
      const { data, error } = await supabase.auth.resetPasswordForEmail(this.email, {
        redirectTo: redirectTo
      });

      console.log('Respuesta completa:', { data, error });

      loading.dismiss();
      this.enviando = false;

      if (error) {
        console.error('Error detallado:', error);

        // Mensaje de error más descriptivo
        let errorMsg = error.message || 'Error desconocido con el servidor';
        if (Object.keys(error).length === 0) {
          errorMsg = 'Error en el servidor de autenticación. Verifica la configuración SMTP.';
        }

        this.presentToast(`Error al enviar enlace: ${errorMsg}`, 'danger');
        return;
      }

      // Notificar éxito incluso si no hubo error (independientemente si el email existe)
      await this.presentAlerta(
        '¡Solicitud procesada!',
        'Si el correo existe en nuestro sistema, recibirá un enlace de recuperación. Por favor revise su bandeja de entrada y carpeta de spam.'
      );
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
      // Verificar la sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session && sessionError) {
        console.error("Error al obtener sesión:", sessionError);
        throw new Error('No hay una sesión activa. El token puede haber expirado.');
      }

      // Actualizar la contraseña del usuario autenticado
      const { error } = await supabase.auth.updateUser({
        password: this.nuevaContrasena
      });

      loading.dismiss();
      this.enviando = false;

      if (error) {
        console.error('Error al actualizar:', error);
        this.presentToast('Error al actualizar contraseña: ' + error.message, 'danger');
        return;
      }

      // Si no hay error, actualizamos el estado y mostramos un mensaje de éxito
      this.paso = 'exito';
      this.presentToast('¡Contraseña actualizada exitosamente!', 'success');

      // Opcionalmente, redirigir al login después de un tiempo
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (error: any) {
      loading.dismiss();
      this.enviando = false;
      console.error('Error completo:', error);

      if (error.message.includes('token') || error.message.includes('sesión')) {
        this.presentAlerta(
          'Enlace expirado',
          'El enlace de recuperación ha expirado o no es válido. Por favor, solicite un nuevo enlace de recuperación.'
        );
        setTimeout(() => {
          this.paso = 'email';
        }, 2000);
      } else {
        this.presentToast('Error al procesar la solicitud: ' + error.message, 'danger');
      }
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
