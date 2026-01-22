import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonCard, IonCardContent, IonItem, IonIcon, IonLabel,
  IonInput, IonButton, LoadingController, ToastController, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cardOutline, lockClosedOutline, personAddOutline, mailOutline,
  callOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline,
  closeCircleOutline, arrowBack
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonCard, IonCardContent, IonItem, IonIcon, IonLabel,
    IonInput, IonButton, IonSpinner
  ]
})
export class RegisterPage {
  // Form fields
  ci = signal<string>('');
  nombre = signal<string>('');
  email = signal<string>('');
  telefono = signal<string>('');
  password = signal<string>('');
  passwordConfirm = signal<string>('');

  // UI state
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showPasswordConfirm = signal<boolean>(false);

  // Password strength
  passwordStrength = signal<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: '', color: 'medium' });

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService
  ) {
    addIcons({
      cardOutline, lockClosedOutline, personAddOutline, mailOutline,
      callOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline,
      closeCircleOutline, arrowBack
    });
  }

  /**
   * Calculate password strength
   */
  calculatePasswordStrength(password: string) {
    let score = 0;
    let label = '';
    let color = 'danger';

    if (!password) {
      this.passwordStrength.set({ score: 0, label: '', color: 'medium' });
      return;
    }

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Determine label and color
    if (score <= 2) {
      label = 'Muy débil';
      color = 'danger';
    } else if (score === 3) {
      label = 'Débil';
      color = 'warning';
    } else if (score === 4) {
      label = 'Media';
      color = 'medium';
    } else if (score === 5) {
      label = 'Fuerte';
      color = 'success';
    } else {
      label = 'Muy fuerte';
      color = 'primary';
    }

    this.passwordStrength.set({ score, label, color });
  }

  /**
   * Validate CI format
   */
  validateCI(): boolean {
    const ciValue = this.ci();

    if (!ciValue) {
      this.presentToast('Por favor ingrese su cédula', 'warning');
      return false;
    }

    if (ciValue.length < 10 || ciValue.length > 13) {
      this.presentToast('La cédula debe tener entre 10 y 13 dígitos', 'warning');
      return false;
    }

    if (!/^\d+$/.test(ciValue)) {
      this.presentToast('La cédula debe contener solo números', 'warning');
      return false;
    }

    return true;
  }

  /**
   * Validate email format
   */
  validateEmail(): boolean {
    const emailValue = this.email();

    if (!emailValue) {
      this.presentToast('Por favor ingrese su email', 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      this.presentToast('Por favor ingrese un email válido', 'warning');
      return false;
    }

    return true;
  }

  /**
   * Validate password
   */
  validatePassword(): boolean {
    const passwordValue = this.password();

    if (!passwordValue) {
      this.presentToast('Por favor ingrese una contraseña', 'warning');
      return false;
    }

    if (passwordValue.length < 8) {
      this.presentToast('La contraseña debe tener al menos 8 caracteres', 'warning');
      return false;
    }

    if (!/[A-Z]/.test(passwordValue)) {
      this.presentToast('La contraseña debe contener al menos una mayúscula', 'warning');
      return false;
    }

    if (!/[a-z]/.test(passwordValue)) {
      this.presentToast('La contraseña debe contener al menos una minúscula', 'warning');
      return false;
    }

    if (!/[0-9]/.test(passwordValue)) {
      this.presentToast('La contraseña debe contener al menos un número', 'warning');
      return false;
    }

    return true;
  }

  /**
   * Validate password confirmation
   */
  validatePasswordConfirm(): boolean {
    if (this.password() !== this.passwordConfirm()) {
      this.presentToast('Las contraseñas no coinciden', 'warning');
      return false;
    }
    return true;
  }

  /**
   * Register user
   */
  async registerUser() {
    // Validate all fields
    if (!this.validateCI()) return;
    if (!this.nombre()) {
      this.presentToast('Por favor ingrese su nombre completo', 'warning');
      return;
    }
    if (!this.validateEmail()) return;
    if (!this.validatePassword()) return;
    if (!this.validatePasswordConfirm()) return;

    const loading = await this.loadingController.create({
      message: 'Creando su cuenta...',
      spinner: 'crescent'
    });
    await loading.present();
    this.isLoading.set(true);

    this.authService.register({
      ci: this.ci(),
      nombre: this.nombre(),
      email: this.email(),
      telefono: this.telefono() || undefined,
      password: this.password()
    }).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading.set(false);

        if (response.success && response.data) {
          this.presentToast('¡Registro exitoso! Bienvenido al CNC', 'success');

          // Auto-login after registration
          const roleId = response.data.user.rol?.id || 0;
          setTimeout(() => {
            this.redirigirUsuario(roleId);
          }, 1500);
        } else {
          this.presentToast(response.message || 'Error al registrarse', 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading.set(false);
        console.error('[REGISTER_PAGE] Registration error:', error);

        const msg = error.error?.message || 'Error al crear la cuenta';
        this.presentToast(msg, 'danger');
      }
    });
  }

  /**
   * Redirect user based on role
   */
  redirigirUsuario(rolId: number) {
    if (rolId === 1) { // Admin
      this.router.navigate(['/admin/crudusuarios']);
    } else {
      this.router.navigate(['/user/certificaciones']);
    }
  }

  /**
   * Go to login page
   */
  iraLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * Show toast message
   */
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
  updateCi(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.ci.set(value);
  }

  updateNombre(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.nombre.set(value);
  }

  updateEmail(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.email.set(value);
  }

  updateTelefono(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.telefono.set(value);
  }

  updatePassword(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.password.set(value);
    this.calculatePasswordStrength(value);
  }

  updatePasswordConfirm(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.passwordConfirm.set(value);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  togglePasswordConfirmVisibility() {
    this.showPasswordConfirm.set(!this.showPasswordConfirm());
  }
}
