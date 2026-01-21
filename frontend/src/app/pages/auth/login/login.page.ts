import { IonicModule } from '@ionic/angular';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
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
  ) { }

  ngOnInit() {
    this.verificarSesionActiva();
  }

  async verificarSesionActiva() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: (user) => {
          this.authService.setAuthData(user, token);
          this.redirigirUsuario(user.rol.id);
        },
        error: () => {
          localStorage.removeItem('token');
          console.log('Sesión inválida');
        }
      })
    }
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

        if (response.token) {
          this.authService.setAuthData(response.user, response.token);
          this.presentToast('Sesión iniciada correctamente', 'success');
          this.redirigirUsuario(response.user.rolId);
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading.set(false);
        console.error('Login error:', error);
        const msg = error.error?.error || 'Usuario o contraseña incorrectos';
        this.presentToast(msg, 'danger');
      }
    });
  }

  redirigirUsuario(rolId: number) {
    if (rolId === 1) { // Asumiendo 1 es Admin basado en seeds
      this.router.navigate(['/admin/crudusuarios']);
    } else {
      this.router.navigate(['/user/cerificaciones']); // Mantener typo original por compatibilidad
    }
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
