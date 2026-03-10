import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonLabel,
  IonInput, IonButton, LoadingController, ToastController, IonSpinner,
  IonSelect, IonSelectOption, IonCheckbox,
  IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cardOutline, lockClosedOutline, personAddOutline, mailOutline,
  callOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline,
  closeCircleOutline, arrowBack, personOutline, mapOutline, locationOutline,
  maleFemaleOutline, peopleCircleOutline, calendarOutline, briefcaseOutline,
  flagOutline, arrowForwardOutline, arrowBackOutline, shieldCheckmarkOutline, refreshOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { RegisterStateService } from './register.state';
import { RouterModule } from '@angular/router';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { Provincia } from 'src/app/shared/models/provincia.model';
import { Canton } from 'src/app/shared/models/canton.model';
import { Genero } from 'src/app/shared/models/genero.model';
import { Etnia } from 'src/app/shared/models/etnia.model';
import { TipoParticipante } from 'src/app/shared/models/tipo-participante.model';
import { TipoParticipanteEnum, NivelGobiernoEnum } from 'src/app/shared/constants/enums';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent, IonIcon, IonLabel,
    IonInput, IonButton, IonSpinner,
    IonSelect, IonSelectOption, IonCheckbox,
    IonModal
  ]
})
export class RegisterPage {
  TipoParticipanteEnum = TipoParticipanteEnum;
  NivelGobiernoEnum = NivelGobiernoEnum;
  // Expose state signals
  step = this.state.step;
  userData = this.state.userData;
  personalData = this.state.personalData;
  laborData = this.state.laborData;
  termsData = this.state.termsData;

  // Inject AuthService
  private authService = inject(AuthService);
  private catalogoService = inject(CatalogoService);

  // Catalogo data
  provincias = signal<Provincia[]>([]);
  cantones = signal<Canton[]>([]);
  filteredCantones = signal<Canton[]>([]);
  generos = signal<Genero[]>([]);
  etnias = signal<Etnia[]>([]);
  nacionalidades = signal<any[]>([]);
  tiposParticipante = signal<TipoParticipante[]>([]);

  // Labor Specific Catalogs
  cargos = signal<any[]>([]);
  entidades = signal<any[]>([]); // "Nivel de gobierno u otro"
  mancomunidades = signal<any[]>([]);
  competencias = signal<any[]>([]);
  gradosOcupacionales = signal<any[]>([]);
  instituciones = signal<any[]>([]);

  // Local UI state
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showPasswordConfirm = signal<boolean>(false);

  termsText = `
    <p><strong>CONVENIO DE RESPONSABILIDAD DE USO DE PLATAFORMA DEL CNC</strong></p>
    <p>Al utilizar este sistema, usted se compromete a proporcionar información veraz y verificable.</p>
    <p>El Consejo Nacional de Competencias (CNC) garantiza la protección de sus datos personales y su uso exclusivo para los fines de capacitación y fortalecimiento institucional descritos, en estricto apego a la Ley Orgánica de Protección de Datos Personales del Ecuador.</p>
    <p>1. Todo registro que contenga información adulterada será eliminado y reportado a las autoridades pertinentes.</p>
    <p>2. Las capacitaciones y certificaciones otorgadas de manera gratuita son intransferibles.</p>
    <p>Firma Electrónica: El usuario reconoce que las interacciones dentro del portal tienen valor probatorio para trámites internos y oficiales del CNC.</p>
  `;

  passwordStrength = signal<{ score: number; label: string; color: string }>({ score: 0, label: '', color: 'medium' });

  // Captcha Exercise State
  showCaptchaChallenge = signal<boolean>(false);
  isVerifyingCaptcha = signal<boolean>(false);
  captchaMockImages = signal<{ url: string, selected: boolean }[]>([
    { url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=150&h=150', selected: false },
    { url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=150&h=150', selected: false },
    { url: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=150&h=150', selected: false },
    { url: 'https://images.unsplash.com/photo-1566373892301-26757b019b5b?auto=format&fit=crop&w=150&h=150', selected: false },
    { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=150&h=150', selected: false },
    { url: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=150&h=150', selected: false },
    { url: 'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?auto=format&fit=crop&w=150&h=150', selected: false },
    { url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=150&h=150', selected: false },
    { url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=150&h=150', selected: false }
  ]);

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
      flagOutline, arrowForwardOutline, arrowBackOutline, shieldCheckmarkOutline, refreshOutline
    });
  }

  ngOnInit() {
    this.loadCatalogos();
  }

  async loadCatalogos() {
    try {
      const [provinciasResp, cantonesResp, generosResp, etniasResp, tiposParticipanteResp, nacionalidadesResp, cargosResp, entidadesResp, mancomunidadesResp, competenciasResp, gradosOcupacionalesResp, institucionesResp] = await Promise.all([
        firstValueFrom(this.catalogoService.getItems('provincias')),
        firstValueFrom(this.catalogoService.getItems('cantones')),
        firstValueFrom(this.catalogoService.getItems('generos')),
        firstValueFrom(this.catalogoService.getItems('etnias')),
        firstValueFrom(this.catalogoService.getItems('tipos-participante')),
        firstValueFrom(this.catalogoService.getItems('nacionalidades')),
        firstValueFrom(this.catalogoService.getItems('public/cargos')),
        firstValueFrom(this.catalogoService.getItems('public/entidades')),
        firstValueFrom(this.catalogoService.getItems('public/mancomunidades')),
        firstValueFrom(this.catalogoService.getItems('public/competencias')),
        firstValueFrom(this.catalogoService.getItems('public/grados-ocupacionales')),
        firstValueFrom(this.catalogoService.getItems('public/instituciones'))
      ]);

      // Only active ones, sorted (Backend returns id, nombre, estado, etc.)
      const activeProvincias = (provinciasResp || [])
        .filter((p: any) => p.estado !== false) // backend may not return estado or return true
        .sort((a: any, b: any) => (a.nombre || '').localeCompare(b.nombre || ''));

      const activeCantones = (cantonesResp || [])
        .filter((c: any) => c.estado !== false)
        .sort((a: any, b: any) => (a.nombre || '').localeCompare(b.nombre || ''));

      this.provincias.set(activeProvincias);
      this.cantones.set(activeCantones);
      this.generos.set(generosResp || []);
      this.etnias.set(etniasResp || []);
      this.nacionalidades.set(nacionalidadesResp || []);
      this.tiposParticipante.set(tiposParticipanteResp || []);
      this.cargos.set(cargosResp || []);
      this.entidades.set(entidadesResp || []);
      this.mancomunidades.set(mancomunidadesResp || []);
      this.competencias.set(competenciasResp || []);
      this.gradosOcupacionales.set(gradosOcupacionalesResp || []);
      this.instituciones.set(institucionesResp || []);

      // Resolve Dynamic IDs
      const findIdByCodigo = (list: any[], codigo: string, fallback: number) => {
        const match = list.find((i: any) => i.codigo === codigo);
        return match ? match.id : fallback;
      };

      const newResolvedIds = {
        tipoAutoridad: findIdByCodigo(tiposParticipanteResp, 'AUTORIDAD', TipoParticipanteEnum.AUTORIDAD),
        tipoCiudadano: findIdByCodigo(tiposParticipanteResp, 'CIUDADANO', TipoParticipanteEnum.CIUDADANO),
        tipoFuncionario: findIdByCodigo(tiposParticipanteResp, 'FUNCIONARIO_GAD', TipoParticipanteEnum.FUNCIONARIO_GAD),
        tipoInstitucion: findIdByCodigo(tiposParticipanteResp, 'INSTITUCION', TipoParticipanteEnum.INSTITUCION),
        nivelProvincial: findIdByCodigo(entidadesResp, 'NIVEL_PROVINCIAL', NivelGobiernoEnum.PROVINCIAL),
        nivelMunicipal: findIdByCodigo(entidadesResp, 'NIVEL_MUNICIPAL', NivelGobiernoEnum.MUNICIPAL),
        nivelParroquial: findIdByCodigo(entidadesResp, 'NIVEL_PARROQUIAL', NivelGobiernoEnum.PARROQUIAL),
        nivelMancomunidad: findIdByCodigo(entidadesResp, 'MANCOMUNIDADES', NivelGobiernoEnum.MANCOMUNIDADES),
      };

      this.state.updateUserData({ resolvedIds: newResolvedIds } as any);

      // If reloading from session and we already had a provinciaId, restore the filtered cantones list immediately.
      const currentProv = this.userData().provinciaId;
      if (currentProv) {
        this.filteredCantones.set(activeCantones.filter((c: any) => Number(c.provinciaId) === Number(currentProv)));
      }

    } catch (e) {
      console.error('Error loading catalogues', e);
      this.presentToast('Error al cargar datos del formulario', 'danger');
    }
  }

  onProvinciaChange(event: any) {
    const provId = event.detail.value;
    this.state.updateUserData({ provinciaId: provId, cantonId: undefined });

    // Filter cantons by selected province
    if (provId) {
      const filtered = this.cantones().filter((c: any) => c.provinciaId === provId);
      this.filteredCantones.set(filtered);
    } else {
      this.filteredCantones.set([]);
    }
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
    if (!data.provinciaId) {
      this.presentToast('Debe seleccionar una provincia', 'warning');
      return false;
    }
    if (!data.cantonId) {
      this.presentToast('Debe seleccionar un cantón', 'warning');
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
    if (!data.generoId || !data.etniaId) {
      this.presentToast('Seleccione su género y etnia', 'warning');
      return false;
    }
    if (!data.nacionalidadId) {
      this.presentToast('Seleccione su nacionalidad', 'warning');
      return false;
    }
    if (!data.celular || data.celular.length < 10) {
      this.presentToast('Ingrese un número de celular válido de 10 dígitos', 'warning');
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
    const resIds = this.state.resolvedIds();

    if (data.tipoParticipanteId === undefined) {
      this.presentToast('Seleccione un tipo de participante', 'warning');
      return false;
    }

    if (data.tipoParticipanteId === resIds.tipoAutoridad) { // Autoridad
      if (!data.autoridad?.cargo || !data.autoridad?.nivelgobierno || !data.autoridad?.gadAutoridad) {
        this.presentToast('Complete todos los campos para Autoridad', 'warning');
        return false;
      }
    } else if (data.tipoParticipanteId === resIds.tipoFuncionario) { // Funcionario
      if (!data.funcionarioGad?.cargo || !data.funcionarioGad?.nivelgobierno || !data.funcionarioGad?.gadFuncionarioGad || !data.funcionarioGad?.competencias || data.funcionarioGad.competencias.length === 0) {
        this.presentToast('Complete todos los campos para Funcionario GAD, incluyendo competencias', 'warning');
        return false;
      }
    } else if (data.tipoParticipanteId === resIds.tipoInstitucion) { // Institucion
      if (!data.institucion?.institucion || !data.institucion?.gradoOcupacional || !data.institucion?.cargo) {
        this.presentToast('Complete todos los campos para Institución (institución, grado ocupacional y cargo)', 'warning');
        return false;
      }
    }

    return true;
  }

  // --- Actions ---

  async registerUser() {
    if (!this.termsData().termsAccepted) {
      this.presentToast('Debe aceptar los términos y condiciones', 'warning');
      return;
    }
    if (!this.termsData().captchaVerified) {
      this.presentToast('Por favor, verifique que no es un robot', 'warning');
      return;
    }

    // Doble validación final por si hubo recarga de página (ej. se borró la contraseña)
    if (!this.validateStep2() || !this.validateStep3() || !this.validateStep4()) {
      this.presentToast('Faltan datos requeridos. Por favor revise los pasos anteriores.', 'danger');
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
          this.state.reset();
          // Reset captcha too
          this.isVerifyingCaptcha.set(false);
          this.showCaptchaChallenge.set(false);
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
    let color = 'medium';

    if (password.length > 0) score += 1;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    score = Math.min(5, score);

    switch (score) {
      case 0: label = ''; color = 'medium'; break;
      case 1:
      case 2: label = 'Débil'; color = 'danger'; break;
      case 3: label = 'Media'; color = 'warning'; break;
      case 4: label = 'Fuerte'; color = 'success'; break;
      case 5: label = 'Muy Fuerte'; color = 'success'; break;
    }

    this.passwordStrength.set({ score, label, color });
  }

  // Captcha Exercise Challenge Methods
  openCaptcha() {
    if (!this.termsData().captchaVerified && !this.isVerifyingCaptcha()) {
      this.captchaMockImages.update(imgs => imgs.map(img => ({ ...img, selected: false })));
      this.showCaptchaChallenge.set(true);
    }
  }

  toggleCaptchaImage(index: number) {
    this.captchaMockImages.update(imgs => {
      const copy = [...imgs];
      copy[index].selected = !copy[index].selected;
      return copy;
    });
  }

  verifyMockCaptcha() {
    this.showCaptchaChallenge.set(false);
    this.isVerifyingCaptcha.set(true);
    setTimeout(() => {
      this.isVerifyingCaptcha.set(false);
      this.state.updateUserData({ captchaVerified: true });
    }, 1200);
  }

  /*
  // ============================================
  // --- GOOGLE RECAPTCHA VERIFICATION (PROD) ---
  // ============================================
  onCaptchaResolved(token: string | null) {
    if (token) {
      this.state.updateUserData({ captchaVerified: true, captchaToken: token });
    } else {
      // Captcha expired
      this.state.updateUserData({ captchaVerified: false, captchaToken: undefined });
    }
  }
  // ============================================
  */

  async presentToast(msg: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: msg, duration: 2000, color, position: 'bottom'
    });
    await toast.present();
  }
}
