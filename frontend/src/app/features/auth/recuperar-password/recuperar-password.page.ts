import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingController, ToastController, AlertController, Platform, IonContent, IonItem, IonIcon, IonLabel, IonInput, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, paperPlaneOutline, lockClosedOutline, saveOutline, checkmarkCircle, closeCircle, informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonItem, IonIcon, IonLabel,
    IonInput, IonButton, IonSpinner, RouterLink
  ]
})
export class RecuperarPasswordPage implements OnInit {
  // Signals for state management
  email = signal<string>('');
  nuevaContrasena = signal<string>('');
  confirmarContrasena = signal<string>('');
  paso = signal<'email' | 'resetear' | 'exito'>('email');
  enviando = signal<boolean>(false);
  token = signal<string | null>(null);

  siteURL: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  constructor() {
    addIcons({
      mailOutline, paperPlaneOutline, lockClosedOutline,
      saveOutline, checkmarkCircle, closeCircle, informationCircleOutline
    });
  }

  ngOnInit() {
    this.siteURL = window.location.origin;

    // Verificar si hay un token de recuperación en la URL
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'recovery' && params['token']) {
        this.token.set(params['token']);
        this.paso.set('resetear');
      }
    });
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
    const emailVal = this.email();
    if (!emailVal) {
      this.presentToast('Por favor ingrese su correo electrónico', 'warning');
      return;
    }

    this.enviando.set(true);
    const loading = await this.loadingController.create({
      message: 'Procesando solicitud...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const redirectTo = environment.redirectUrl || `${window.location.origin}/recuperar-password`;

      this.authService.requestPasswordReset(emailVal, redirectTo).subscribe({
        next: () => {
          loading.dismiss();
          this.enviando.set(false);
          this.presentAlerta(
            '¡Solicitud procesada!',
            'Si el correo existe en nuestro sistema, recibirá un enlace de recuperación. Por favor revise su bandeja de entrada.'
          );
        },
        error: (error) => {
          loading.dismiss();
          this.enviando.set(false);
          this.presentToast('Error al enviar solicitud', 'danger');
        }
      });
    } catch (error: any) {
      loading.dismiss();
      this.enviando.set(false);
      this.presentToast('Error crítico', 'danger');
    }
  }

  async actualizarContrasena() {
    const password = this.nuevaContrasena();
    const confirm = this.confirmarContrasena();
    const resetToken = this.token();

    if (!password || !confirm) {
      this.presentToast('Por favor, complete todos los campos', 'warning');
      return;
    }

    if (password !== confirm) {
      this.presentToast('Las contraseñas no coinciden', 'danger');
      return;
    }

    if (password.length < 8 || !this.hasUpperCase(password) || !this.hasLowerCase(password) || !this.hasDigit(password)) {
      this.presentToast('La contraseña no cumple con los requisitos mínimos', 'warning');
      return;
    }

    this.enviando.set(true);
    const loading = await this.loadingController.create({
      message: 'Actualizando contraseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.authService.updatePassword(password, resetToken || undefined).subscribe({
        next: () => {
          loading.dismiss();
          this.enviando.set(false);
          this.paso.set('exito');
          this.presentToast('¡Contraseña actualizada exitosamente!', 'success');
        },
        error: (error) => {
          loading.dismiss();
          this.enviando.set(false);
          this.presentToast('Error al actualizar contraseña. El enlace puede haber expirado.', 'danger');
        }
      });
    } catch (error: any) {
      loading.dismiss();
      this.enviando.set(false);
      this.presentToast('Error crítico al procesar la solicitud', 'danger');
    }
  }

  volver() {
    if (this.paso() === 'resetear') {
      this.paso.set('email');
    } else {
      this.router.navigate(['/login']);
    }
  }

  updateEmail(event: Event) {
    this.email.set((event.target as HTMLInputElement).value);
  }

  updateNuevaContrasena(event: Event) {
    this.nuevaContrasena.set((event.target as HTMLInputElement).value);
  }

  updateConfirmarContrasena(event: Event) {
    this.confirmarContrasena.set((event.target as HTMLInputElement).value);
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  async presentAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}


