import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  ci: string = '';
  password: string = '';

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
    // Validar que los campos no estén vacíos
    if (!this.ci || !this.password) {
      this.presentToast('Por favor, complete todos los campos', 'warning');
      return;
    }

    // Validar formato de cédula (básico)
    if (this.ci.length !== 10) {
      this.presentToast('La cédula debe tener 10 dígitos', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    this.authService.login(this.ci, this.password).subscribe({
      next: async (response) => {
        await loading.dismiss();

        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user_role', response.user.rolId.toString());
          localStorage.setItem('auth_uid', response.user.id.toString());

          this.presentToast('Sesión iniciada correctamente', 'success');
          this.redirigirUsuario(response.user.rolId);
        }
      },
      error: async (error) => {
        await loading.dismiss();
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
      this.router.navigate(['/user/cerificaciones']); // Corregido typo en ruta original 'cerificaciones' -> 'certificaciones' si fuera el caso, pero mantengo original por compatibilidad
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
}
