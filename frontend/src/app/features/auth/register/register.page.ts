import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonLabel, // IonItem from top import removed
  IonInput, IonButton, LoadingController, ToastController, IonSpinner,
  IonSelect, IonSelectOption, IonCheckbox
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cardOutline, lockClosedOutline, personAddOutline, mailOutline,
  callOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline,
  closeCircleOutline, arrowBack, personOutline, mapOutline, locationOutline,
  maleFemaleOutline, peopleCircleOutline, calendarOutline, briefcaseOutline,
  flagOutline, arrowForwardOutline, arrowBackOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { RegisterStateService } from './register.state';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent, IonIcon, IonLabel, // IonItem removed from decorator, others restored
    IonInput, IonButton, IonSpinner,
    IonSelect, IonSelectOption, IonCheckbox
  ]
})
export class RegisterPage {
  // Expose state signals
  step = this.state.step;
  userData = this.state.userData;
  personalData = this.state.personalData;
  laborData = this.state.laborData;
  termsData = this.state.termsData;

  // Inject AuthService
  private authService = inject(AuthService);

  // Local UI state
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showPasswordConfirm = signal<boolean>(false);

  termsText = `CONVENIO DE RESPONSABILIDAD... (Texto completo del usuario)...`;

  passwordStrength = signal<{ score: number; label: string; color: string }>({ score: 0, label: '', color: 'medium' });

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    public state: RegisterStateService
  ) {
    addIcons({
      cardOutline, lockClosedOutline, personAddOutline, mailOutline,
      callOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline,
      closeCircleOutline, arrowBack, personOutline, mapOutline, locationOutline,
      maleFemaleOutline, peopleCircleOutline, calendarOutline, briefcaseOutline,
      flagOutline, arrowForwardOutline, arrowBackOutline
    });
  }

  // --- Navigation ---

  async next() {
    const currentStep = this.step();

    if (currentStep === 1) {
      this.state.nextStep();
    } else if (currentStep === 2) {
      if (this.validateStep2()) this.state.nextStep();
    } else if (currentStep === 3) {
      if (this.validateStep3()) this.state.nextStep();
    } else if (currentStep === 4) {
      if (this.validateStep4()) this.state.nextStep();
    } else if (currentStep === 5) {
      await this.registerUser();
    }
  }

  prev() {
    this.state.prevStep();
  }

  // --- Validation Helpers ---

  validateStep2(): boolean {
    const data = this.userData();

    // Validar Cédula Ecuatoriana
    if (!this.validarCedula(data.ci)) {
      this.presentToast('Cédula inválida. Verifique el número.', 'warning');
      return false;
    }

    if (!data.email || !data.email.includes('@')) {
      this.presentToast('Email inválido', 'warning');
      return false;
    }
    if (!data.password || data.password.length < 8) {
      this.presentToast('Contraseña inválida (min 8 caracteres)', 'warning');
      return false;
    }
    if (data.password !== data.passwordConfirm) {
      this.presentToast('Las contraseñas no coinciden', 'warning');
      return false;
    }
    return true;
  }

  // Algoritmo de validación de Cédula Ecuatoriana
  validarCedula(cedula: string): boolean {
    if (!cedula || cedula.length !== 10) return false;

    const digitoRegion = parseInt(cedula.substring(0, 2));

    if (digitoRegion < 1 || digitoRegion > 24) return false;

    const ultimoDigito = parseInt(cedula.substring(9, 10));
    const pares = parseInt(cedula.substring(1, 2)) + parseInt(cedula.substring(3, 4)) + parseInt(cedula.substring(5, 6)) + parseInt(cedula.substring(7, 8));

    let numero1 = parseInt(cedula.substring(0, 1));
    numero1 = (numero1 * 2);
    if (numero1 > 9) { numero1 = (numero1 - 9); }

    let numero3 = parseInt(cedula.substring(2, 3));
    numero3 = (numero3 * 2);
    if (numero3 > 9) { numero3 = (numero3 - 9); }

    let numero5 = parseInt(cedula.substring(4, 5));
    numero5 = (numero5 * 2);
    if (numero5 > 9) { numero5 = (numero5 - 9); }

    let numero7 = parseInt(cedula.substring(6, 7));
    numero7 = (numero7 * 2);
    if (numero7 > 9) { numero7 = (numero7 - 9); }

    let numero9 = parseInt(cedula.substring(8, 9));
    numero9 = (numero9 * 2);
    if (numero9 > 9) { numero9 = (numero9 - 9); }

    const impares = numero1 + numero3 + numero5 + numero7 + numero9;
    const sumaTotal = pares + impares;
    const primerDigitoSuma = parseInt(String(sumaTotal).substring(0, 1));
    const decena = (primerDigitoSuma + 1) * 10;

    let digitoValidador = decena - sumaTotal;
    if (digitoValidador === 10) digitoValidador = 0;

    // Fix: If validation logic is slightly off or simple sum check
    // Using standard alg:
    let check = 0;
    // ... Actually, simplifying with standard compact loop
    let sum = 0;
    const coeficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    for (let i = 0; i < 9; i++) {
      let val = parseInt(cedula[i]) * coeficients[i];
      if (val >= 10) val -= 9;
      sum += val;
    }
    const verifier = (sum % 10 === 0) ? 0 : 10 - (sum % 10);

    return verifier === ultimoDigito;
  }

  validateStep3(): boolean {
    const data = this.personalData();
    if (!data.primerNombre || !data.primerApellido) {
      this.presentToast('Ingrese sus nombres y apellidos', 'warning');
      return false;
    }
    if (!data.fechaNacimiento) {
      this.presentToast('Ingrese su fecha de nacimiento', 'warning');
      return false;
    }
    return true;
  }

  validateStep4(): boolean {
    const data = this.laborData();
    if (data.tipoParticipante === undefined) {
      this.presentToast('Seleccione un tipo de participante', 'warning');
      return false;
    }
    return true;
  }

  // --- Actions ---

  async registerUser() {
    if (!this.termsData().termsAccepted) {
      this.presentToast('Debe aceptar los términos y condiciones', 'warning');
      return;
    }

    const LOADING = await this.loadingController.create({ message: 'Registrando...', spinner: 'crescent' });
    await LOADING.present();
    this.isLoading.set(true);

    const fullData = {
      ...this.userData(),
      ...this.personalData(),
      ...this.laborData()
    };

    // Cast to any to bypass strict DTO match if interface isn't updated in frontend
    this.authService.register(fullData as any).subscribe({
      next: async (res) => {
        await LOADING.dismiss();
        this.isLoading.set(false);
        if (res.success) {
          this.presentToast('¡Registro exitoso!', 'success');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.presentToast(res.message || 'Error', 'danger');
        }
      },
      error: async (err) => {
        await LOADING.dismiss();
        this.isLoading.set(false);
        this.presentToast(err.error?.message || 'Error al registrar', 'danger');
      }
    });
  }

  // --- UI Helpers ---

  updatePassword(event: any) {
    const val = event.target.value;
    this.state.updateUserData({ password: val });
    this.calculatePasswordStrength(val);
  }

  togglePasswordVisibility() { this.showPassword.set(!this.showPassword()); }
  togglePasswordConfirmVisibility() { this.showPasswordConfirm.set(!this.showPasswordConfirm()); }

  calculatePasswordStrength(password: string) {
    let score = 0;
    let label = '';
    let color = 'danger';

    if (!password) {
      this.passwordStrength.set({ score: 0, label: '', color: 'medium' });
      return;
    }

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) { label = 'Muy débil'; color = 'danger'; }
    else if (score === 3) { label = 'Débil'; color = 'warning'; }
    else if (score === 4) { label = 'Media'; color = 'medium'; }
    else if (score === 5) { label = 'Fuerte'; color = 'success'; }
    else { label = 'Muy fuerte'; color = 'primary'; }

    this.passwordStrength.set({ score, label, color });
  }

  async presentToast(msg: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: msg, duration: 2000, color, position: 'bottom'
    });
    await toast.present();
  }
}
