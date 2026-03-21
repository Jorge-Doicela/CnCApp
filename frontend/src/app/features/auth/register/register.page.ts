import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonLabel,
  IonInput, IonButton, LoadingController, ToastController, IonSpinner,
  IonSelect, IonSelectOption, IonCheckbox, AlertController,
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
  recaptchaWidgetId: number | null = null;

  termsText = `
    <p><strong>CONVENIO DE RESPONSABILIDAD DE USO DE PLATAFORMA DEL CNC</strong></p>
    <p>Al utilizar este sistema, usted se compromete a proporcionar información veraz y verificable.</p>
    <p>El Consejo Nacional de Competencias (CNC) garantiza la protección de sus datos personales y su uso exclusivo para los fines de capacitación y fortalecimiento institucional descritos, en estricto apego a la Ley Orgánica de Protección de Datos Personales del Ecuador.</p>
    <p>1. Todo registro que contenga información adulterada será eliminado y reportado a las autoridades pertinentes.</p>
    <p>2. Las capacitaciones y certificaciones otorgadas de manera gratuita son intransferibles.</p>
    <p>Firma Electrónica: El usuario reconoce que las interacciones dentro del portal tienen valor probatorio para trámites internos y oficiales del CNC.</p>
  `;

  passwordStrength = signal<{ score: number; label: string; color: string }>({ score: 0, label: '', color: 'medium' });

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
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

  ngAfterViewInit() {
    this.initRecaptcha();
  }

  initRecaptcha() {
    const checkGrecaptcha = setInterval(() => {
      if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
        clearInterval(checkGrecaptcha);
        try {
          this.recaptchaWidgetId = (window as any).grecaptcha.render('register-recaptcha-wrapper', {
            'sitekey': '6LeIFo8sAAAAANn2CU_a1H2DgyagspGvU3OTsfps',
            'theme': 'light'
          });
        } catch(e) { console.error('Recaptcha init err', e); }
      }
    }, 500);
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
        firstValueFrom(this.catalogoService.getItems('public/tipos-institucion')),
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

      const findIdByNombre = (list: any[], nombre: string, fallback: number) => {
        const match = list.find((i: any) => i.nombre === nombre);
        return match ? match.id : fallback;
      };

      const newResolvedIds = {
        tipoAutoridad: findIdByCodigo(tiposParticipanteResp, 'AUTORIDAD', TipoParticipanteEnum.AUTORIDAD),
        tipoCiudadano: findIdByCodigo(tiposParticipanteResp, 'CIUDADANO', TipoParticipanteEnum.CIUDADANO),
        tipoFuncionario: findIdByCodigo(tiposParticipanteResp, 'FUNCIONARIO_GAD', TipoParticipanteEnum.FUNCIONARIO_GAD),
        tipoInstitucion: findIdByCodigo(tiposParticipanteResp, 'INSTITUCION', TipoParticipanteEnum.INSTITUCION),
        nivelProvincial: findIdByNombre(entidadesResp, 'PROVINCIAL', NivelGobiernoEnum.PROVINCIAL),
        nivelMunicipal: findIdByNombre(entidadesResp, 'MUNICIPAL', NivelGobiernoEnum.MUNICIPAL),
        nivelParroquial: findIdByNombre(entidadesResp, 'PARROQUIAL RURAL', NivelGobiernoEnum.PARROQUIAL),
        nivelMancomunidad: findIdByNombre(entidadesResp, 'MANCOMUNIDADES Y CONSORCIOS', NivelGobiernoEnum.MANCOMUNIDADES),
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
  // Algoritmo de validación de Documento de Identidad
  validarCedula(cedula: string): boolean {
    if (!cedula || cedula.length < 5) return false;

    // Si no tiene exactamente 10 numéricos, se acepta como documento extranjero (pasaporte, etc)
    if (!/^\d{10}$/.test(cedula)) return true;

    const digitoRegion = parseInt(cedula.substring(0, 2), 10);
    // Válido para 01-24 y 30 (ecuatorianos en el exterior o nacionalizados)
    if ((digitoRegion < 1 || digitoRegion > 24) && digitoRegion !== 30) return false;

    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    // Para personas naturales el tercer dígito es menor a 6
    if (tercerDigito >= 6) return false;

    const ultimoDigito = parseInt(cedula.substring(9, 10), 10);
    
    let sum = 0;
    const coeficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    for (let i = 0; i < 9; i++) {
      let val = parseInt(cedula[i], 10) * coeficients[i];
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

    let recaptchaToken = '';
    if (this.recaptchaWidgetId !== null) {
       recaptchaToken = (window as any).grecaptcha?.getResponse(this.recaptchaWidgetId);
    } else {
       recaptchaToken = (window as any).grecaptcha?.getResponse();
    }

    if (!recaptchaToken) {
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
      ...this.laborData(),
      recaptchaToken
    };

    // Cast to any to bypass strict DTO match if interface isn't updated in frontend
    this.authService.register(fullData as any).subscribe({
      next: async (res) => {
        await LOADING.dismiss();
        this.isLoading.set(false);
        if (res.success) {
          const alert = await this.alertController.create({
             header: '¡Registro Exitoso!',
             message: 'Hemos enviado un enlace de confirmación a tu correo electrónico. Por favor, revísalo (y tu carpeta de Spam) para activar tu cuenta antes de iniciar sesión.',
             buttons: ['Entendido']
          });
          await alert.present();

          this.state.reset();
          try { 
            if (this.recaptchaWidgetId !== null) {
              (window as any).grecaptcha?.reset(this.recaptchaWidgetId); 
            } else {
              (window as any).grecaptcha?.reset();
            }
          } catch(e) {}
          this.router.navigate(['/login']);
        } else {
          try { 
            if (this.recaptchaWidgetId !== null) {
              (window as any).grecaptcha?.reset(this.recaptchaWidgetId); 
            } else {
              (window as any).grecaptcha?.reset();
            }
          } catch(e) {}
          this.presentToast(res.message || 'Error', 'danger');
        }
      },
      error: async (err) => {
        try { await LOADING.dismiss(); } catch(e){}
        this.isLoading.set(false);
        try { 
            if (this.recaptchaWidgetId !== null) {
              (window as any).grecaptcha?.reset(this.recaptchaWidgetId); 
            } else {
              (window as any).grecaptcha?.reset();
            }
        } catch(e) {}
        this.presentToast(err.error?.message || err.message || 'Error al conectar con el servidor', 'danger');
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

  async presentToast(msg: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: msg, duration: 2000, color, position: 'bottom'
    });
    await toast.present();
  }
}
