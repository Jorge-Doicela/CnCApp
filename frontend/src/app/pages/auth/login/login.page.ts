import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonCard, IonCardContent, IonItem, IonIcon, IonLabel,
  IonInput, IonButton, LoadingController, ToastController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cardOutline, lockClosedOutline, logInOutline, personAddOutline,
  close, arrowBack
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonCard, IonCardContent, IonItem, IonIcon, IonLabel,
    IonInput, IonButton
  ]
})
export class LoginPage implements OnInit {
  // Signals for form state
  ci = signal<string>('');
  password = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService
  ) {
    addIcons({ cardOutline, lockClosedOutline, logInOutline, personAddOutline, close, arrowBack });
  }

  ngOnInit() {
    // Session state is automatically loaded by AuthService
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
        const msg = error.error?.message || 'Cédula o contraseña incorrectos';
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
