import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonCheckbox,
  ToastController, LoadingController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  shieldCheckmarkOutline, keyOutline, saveOutline, checkmarkDoneOutline, checkmarkDoneCircleOutline,
  personAddOutline, searchOutline, idCardOutline, businessOutline, shieldOutline, fingerPrintOutline,
  callOutline, peopleOutline, createOutline, trashOutline, mailOutline, lockClosedOutline,
  calendarOutline, maleFemaleOutline, globeOutline, peopleCircleOutline, briefcaseOutline,
  ribbonOutline, constructOutline, analyticsOutline, close as closeIcon, chevronBackOutline,
  chevronForwardOutline, arrowBackOutline, arrowForwardOutline, checkmarkOutline, mapOutline,
  locationOutline, personOutline, eyeOutline, eyeOffOutline, checkmarkCircle, alertCircle
} from 'ionicons/icons';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { TipoParticipanteEnum, NivelGobiernoEnum } from 'src/app/shared/constants/enums';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonButton, IonIcon, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearPage implements OnInit {
  TipoParticipanteEnum = TipoParticipanteEnum;
  NivelGobiernoEnum = NivelGobiernoEnum;
  today: Date = new Date();
  showPassword: boolean = false;
  // Variable para mensajes de validación
  mensajeValidacionCedula: string = '';

  // Mapas para evitar IDs quemados
  resolvedIds = {
    tipoAutoridad: TipoParticipanteEnum.AUTORIDAD,
    tipoCiudadano: TipoParticipanteEnum.CIUDADANO,
    tipoFuncionario: TipoParticipanteEnum.FUNCIONARIO_GAD,
    tipoInstitucion: TipoParticipanteEnum.INSTITUCION,
    nivelProvincial: NivelGobiernoEnum.PROVINCIAL,
    nivelMunicipal: NivelGobiernoEnum.MUNICIPAL,
    nivelParroquial: NivelGobiernoEnum.PARROQUIAL,
    nivelMancomunidad: NivelGobiernoEnum.MANCOMUNIDADES,
    nivelRegimenEspecial: NivelGobiernoEnum.REGIMEN_ESPECIAL,
    rolAdmin: 1 
  };

  usuarioGeneral = {
    // Datos para la validación de supabase
    email: '',
    password: '',
    // Datos generales para todos los usuarios
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    rolId: undefined as number | undefined, // Cambiado a null para requerir selección explícita
    nombre: '',
    ci: '',
    fechaRegistro: new Date(),
    estado: 1, // 1 = Activo
    authUid: '',
    entidadId: undefined as number | undefined,
    firmaUrl: '',
    celular: '',
    generoId: undefined as number | undefined,
    etniaId: undefined as number | undefined,
    nacionalidadId: undefined as number | undefined,
    tipoParticipante: undefined as number | undefined,
    fechaNacimiento: '',
    cantonId: undefined as number | undefined,
    /** Parroquia catálogo oficial GAD (tabla gad_parroquias) */
    gadParroquiaId: undefined as number | undefined,
  };

  autoridad = {
    cargo: '',
    nivelGobierno: undefined as number | undefined,
    gadAutoridad: '',
    idUsuario: '',
  };

  funcionarioGad = {
    cargo: '',
    competencias: [] as number[],
    nivelGobierno: undefined as number | undefined,
    gadFuncionarioGad: '',
    idUsuario: ''
  };

  institucion = {
    /** `i:id` = instituciones_sistema, `e:id` = educacion_basica */
    institucion: undefined as string | undefined,
    institucionNivelGobiernoId: undefined as number | undefined,
    gradoOcupacional: undefined as number | undefined,
    cargo: '',
    idUsuario: ''
  };

  /** Opciones unificadas para el ion-select de institución (sistema + educación básica). */
  opcionesInstitucionCombinadas: { value: string; label: string }[] = [];

  datosrecuperados = {
    roles: [] as any[],
    cargos: [] as any[],
    instituciones: [] as any[],
    educacionBasica: [] as any[],
    provincias: [] as any[],
    cantones: [] as any[],
    // Catálogo oficial plano GAD (gad_parroquias) - puede contener nombres duplicados
    gadParroquias: [] as any[],
    parroquias: [] as any[],
    parroquiasSeleccionadas: [] as any[],
    macrocomunidades: [] as any[],
    municipios: [] as any[],
    competencias: [] as any[],
    gradosOcupacionales: [] as any[],
    tiposParticipante: [] as any[],
    generos: [] as any[],
    etnias: [] as any[],
    entidades: [] as any[],
    mancomunidades: [] as any[],
    regimenesEspeciales: [] as any[],
    nacionalidades: [] as any[],
  };

  datosconcatenar = {
    provinciasConCantones: [] as any[],
  };

  datosbusqueda = {
    selectedProvincia: 0,
    selectedCanton: 0
  };

  // Estado de la página
  isLoading: boolean = false;
  formErrors: any = {};
  // Variable para controlar si los campos de nombre están bloqueados
  camposNombreReadonly: boolean = false;
  // Códigos de provincias para validación de cédula
  provinciasCodigos: { [key: string]: string } = {
    '01': 'Azuay',
    '02': 'Bolívar',
    '03': 'Cañar',
    '04': 'Carchi',
    '05': 'Cotopaxi',
    '06': 'Chimborazo',
    '07': 'El Oro',
    '08': 'Esmeraldas',
    '09': 'Guayas',
    '10': 'Imbabura',
    '11': 'Loja',
    '12': 'Los Ríos',
    '13': 'Manabí',
    '14': 'Morona Santiago',
    '15': 'Napo',
    '16': 'Pastaza',
    '17': 'Pichincha',
    '18': 'Tungurahua',
    '19': 'Zamora Chinchipe',
    '20': 'Galápagos',
    '21': 'Sucumbíos',
    '22': 'Orellana',
    '23': 'Santo Domingo de los Tsáchilas',
    '24': 'Santa Elena',
    '30': 'Ecuatorianos en el exterior'
  };

  cedulaValidada: boolean = false;
  nombresEdited: boolean = false;
  infoVeridica: boolean = false;

  // Wizard State
  passoActual: number = 1;

  private usuarioService = inject(UsuarioService);
  private catalogoService = inject(CatalogoService);

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    addIcons({
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'key-outline': keyOutline,
      'save-outline': saveOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'checkmark-done-circle-outline': checkmarkDoneCircleOutline,
      'person-add-outline': personAddOutline,
      'search-outline': searchOutline,
      'id-card-outline': idCardOutline,
      'business-outline': businessOutline,
      'shield-outline': shieldOutline,
      'finger-print-outline': fingerPrintOutline,
      'call-outline': callOutline,
      'people-outline': peopleOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'calendar-outline': calendarOutline,
      'male-female-outline': maleFemaleOutline,
      'globe-outline': globeOutline,
      'people-circle-outline': peopleCircleOutline,
      'briefcase-outline': briefcaseOutline,
      'ribbon-outline': ribbonOutline,
      'construct-outline': constructOutline,
      'analytics-outline': analyticsOutline,
      'close': closeIcon,
      'chevron-back-outline': chevronBackOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'arrow-back-outline': arrowBackOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'checkmark-outline': checkmarkOutline,
      'map-outline': mapOutline,
      'location-outline': locationOutline,
      'person-outline': personOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'checkmark-circle': checkmarkCircle,
      'alert-circle': alertCircle
    });
  }

  // Wizard Navigation
  proximoPasso() {
    if (this.validarPassoActual()) {
      if (this.passoActual < 5) {
        this.passoActual++;
        this.scrollToTop();
      }
    }
  }

  passoAnterior() {
    if (this.passoActual > 1) {
      this.passoActual--;
      this.scrollToTop();
    }
  }

  irAPasso(passo: number) {
    // Solo permitir ir a pasos anteriores o al siguiente si el actual es válido
    if (passo < this.passoActual) {
      this.passoActual = passo;
    } else if (passo === this.passoActual + 1) {
      if (this.validarPassoActual()) {
        this.passoActual = passo;
      } else {
        this.showToast('Por favor, complete todos los campos obligatorios antes de continuar.');
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private scrollToTop() {
    const content = document.querySelector('ion-content');
    if (content) {
      (content as any).scrollToTop(500);
    }
  }

  validarPassoActual(): boolean {
    switch (this.passoActual) {
      case 1: // Credenciales y Acceso
        if (!this.usuarioGeneral.ci || !this.cedulaValidada) {
          this.showToast('Por favor ingrese y valide su cédula');
          return false;
        }
        if (!this.usuarioGeneral.email || !this.validateEmail(this.usuarioGeneral.email)) {
          return false;
        }
        if (!this.usuarioGeneral.password || this.usuarioGeneral.password.length < 6) {
          this.showToast('La contraseña debe tener al menos 6 caracteres');
          return false;
        }
        if (!this.usuarioGeneral.rolId) {
          this.showToast('Seleccione un rol de usuario');
          return false;
        }
        return true;

      case 2: // Información Personal
        if (!this.usuarioGeneral.primerNombre || !this.usuarioGeneral.primerApellido) {
          this.showToast('Nombre y primer apellido son obligatorios');
          return false;
        }
        if (!this.usuarioGeneral.celular) {
          this.showToast('El número celular es obligatorio');
          return false;
        }
        if (!this.usuarioGeneral.fechaNacimiento) {
          this.showToast('La fecha de nacimiento es obligatoria');
          return false;
        }
        if (!this.usuarioGeneral.generoId || !this.usuarioGeneral.etniaId || !this.usuarioGeneral.nacionalidadId) {
          this.showToast('Género, etnia y nacionalidad son obligatorios');
          return false;
        }
        return true;

      case 3: // Ubicación
        if (!this.datosbusqueda.selectedProvincia) {
          this.showToast('Seleccione una provincia');
          return false;
        }
        if (!this.usuarioGeneral.cantonId && this.datosrecuperados.cantones.length > 0) {
          this.showToast('Seleccione un cantón');
          return false;
        }
        return true;

      case 4: // Datos Específicos
        if (this.usuarioGeneral.tipoParticipante == this.resolvedIds.tipoAutoridad) {
          if (!this.autoridad.cargo || !this.autoridad.nivelGobierno || !this.autoridad.gadAutoridad) {
            this.showToast('Complete todos los campos obligatorios para Autoridad');
            return false;
          }
        } else if (this.usuarioGeneral.tipoParticipante == this.resolvedIds.tipoFuncionario) {
          if (!this.funcionarioGad.cargo || !this.funcionarioGad.nivelGobierno || !this.funcionarioGad.gadFuncionarioGad || !this.funcionarioGad.competencias || this.funcionarioGad.competencias.length === 0) {
            this.showToast('Complete todos los campos obligatorios para Funcionario GAD, incluyendo competencias');
            return false;
          }
        } else if (this.usuarioGeneral.tipoParticipante == this.resolvedIds.tipoInstitucion) {
          if (!this.institucion.institucion || !this.institucion.gradoOcupacional || !this.institucion.cargo) {
            this.showToast('Complete todos los campos obligatorios para Institución');
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  }

  // Getters para el resumen
  getNombreRolSeleccionado(): string {
    const rol = this.datosrecuperados.roles.find(r => r.id === this.usuarioGeneral.rolId);
    return rol ? rol.nombre : 'No seleccionado';
  }

  getNombreProvincia(): string {
    const p = this.datosrecuperados.provincias.find(prov => prov.id === this.datosbusqueda.selectedProvincia);
    return p ? p.nombre : 'No seleccionada';
  }

  getNombreCanton(): string {
    const c = this.datosrecuperados.cantones.find(cant => cant.id === this.usuarioGeneral.cantonId);
    return c ? c.nombre : 'No seleccionado';
  }

  async ngOnInit() {
    // Carga inicial en paralelo de catálogos base
    await Promise.all([
      this.obtenerRoles(),
      this.obtenerProvincias(),
      this.obtenerCargos(),
      this.obtenerInstituciones(),
      this.obtenerGradosOcupacionales(),
      this.obtenerTiposParticipante(),
      this.obtenerGeneros(),
      this.obtenerEtnias(),
      this.obtenerEntidades(),
      this.obtenerRegimenesEspeciales(),
      this.obtenerMancomunidades(),
      this.obtenerCompetencias(),
      this.obtenerNacionalidades(),
      this.obtenerGadParroquias(),
      this.obtenerEducacionBasica()
    ]);

    this.resolveStaticIds();
    this.rebuildOpcionesInstitucion();

    // Restauramos el borrador (una vez cargados los catálogos principales)
    await this.cargarProgreso();
  }

  updateInstitucionTipo(tipoId: number) {
    this.institucion.institucionNivelGobiernoId = tipoId;
    this.institucion.institucion = undefined;
    this.rebuildOpcionesInstitucion();
    this.cdr.markForCheck();
  }

  rebuildOpcionesInstitucion() {
    const selectedTipoId = this.institucion.institucionNivelGobiernoId;
    if (!selectedTipoId) {
      this.opcionesInstitucionCombinadas = [];
      return;
    }

    const tipoSelected = this.datosrecuperados.entidades.find(e => e.id === selectedTipoId);
    const esEducacion = tipoSelected?.nombre?.toUpperCase().includes('EDUCACIÓN');
    const esMancomunidad = tipoSelected?.nombre?.toUpperCase().includes('MANCOMUNIDADES');
    const esRegimenEspecial = tipoSelected?.nombre?.toUpperCase().includes('RÉGIMEN ESPECIAL');

    if (esEducacion) {
      this.opcionesInstitucionCombinadas = (this.datosrecuperados.educacionBasica || []).map((e: any) => ({ value: `e:${e.id}`, label: e.nombre }));
    } else if (esMancomunidad) {
      this.opcionesInstitucionCombinadas = (this.datosrecuperados.mancomunidades || []).map((m: any) => ({ value: `m:${m.id}`, label: m.nombre }));
    } else if (esRegimenEspecial) {
      this.opcionesInstitucionCombinadas = (this.datosrecuperados.regimenesEspeciales || []).map((r: any) => ({ value: `r:${r.id}`, label: r.nombre }));
    } else {
      this.opcionesInstitucionCombinadas = (this.datosrecuperados.instituciones || [])
        .filter((i: any) => i.tipoInstitucionId === selectedTipoId)
        .map((i: any) => ({ value: `i:${i.id}`, label: i.nombre }));
    }

    this.opcionesInstitucionCombinadas.sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }

  getOpcionesMunicipioCombinadas() {
    return (this.datosrecuperados.instituciones || [])
      .filter((i: any) => i.tipoInstitucionId === this.resolvedIds.nivelMunicipal)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  // Persistencia de formulario
  guardarProgreso() {
    const data = {
      usuarioGeneral: this.usuarioGeneral,
      autoridad: this.autoridad,
      funcionarioGad: this.funcionarioGad,
      institucion: this.institucion,
      passoActual: this.passoActual,
      datosbusqueda: this.datosbusqueda,
      infoVeridica: this.infoVeridica,
      nombresEdited: this.nombresEdited
    };
    localStorage.setItem('user_creation_draft', JSON.stringify(data));
  }

  async cargarProgreso() {
    const saved = localStorage.getItem('user_creation_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);

        // Asignamos datos base
        this.usuarioGeneral = { ...this.usuarioGeneral, ...data.usuarioGeneral };
        this.autoridad = { ...this.autoridad, ...data.autoridad };
        this.funcionarioGad = { ...this.funcionarioGad, ...data.funcionarioGad };
        this.institucion = { ...this.institucion, ...data.institucion };
        if (this.institucion.institucion != null && typeof this.institucion.institucion === 'number') {
          this.institucion.institucion = `i:${this.institucion.institucion}`;
        }
        this.passoActual = data.passoActual || 1;
        this.datosbusqueda = { ...this.datosbusqueda, ...data.datosbusqueda };
        this.infoVeridica = data.infoVeridica || false;
        this.nombresEdited = data.nombresEdited !== undefined ? data.nombresEdited : true;

        // Normalización de tipos (Asegurar que IDs sean números para comparaciones estrictas)
        if (this.datosbusqueda.selectedProvincia) this.datosbusqueda.selectedProvincia = Number(this.datosbusqueda.selectedProvincia);
        if (this.usuarioGeneral.cantonId) this.usuarioGeneral.cantonId = Number(this.usuarioGeneral.cantonId);
        if (this.usuarioGeneral.gadParroquiaId) this.usuarioGeneral.gadParroquiaId = Number(this.usuarioGeneral.gadParroquiaId);
        if (this.usuarioGeneral.nacionalidadId) this.usuarioGeneral.nacionalidadId = Number(this.usuarioGeneral.nacionalidadId);
        if (this.usuarioGeneral.tipoParticipante) this.usuarioGeneral.tipoParticipante = Number(this.usuarioGeneral.tipoParticipante);
        if (this.usuarioGeneral.rolId) this.usuarioGeneral.rolId = Number(this.usuarioGeneral.rolId);
        if (this.usuarioGeneral.generoId) this.usuarioGeneral.generoId = Number(this.usuarioGeneral.generoId);
        if (this.usuarioGeneral.etniaId) this.usuarioGeneral.etniaId = Number(this.usuarioGeneral.etniaId);

        // Normalización de niveles de gobierno
        if (this.autoridad.nivelGobierno) this.autoridad.nivelGobierno = Number(this.autoridad.nivelGobierno);
        if (this.funcionarioGad.nivelGobierno) this.funcionarioGad.nivelGobierno = Number(this.funcionarioGad.nivelGobierno);

        // Restauración secuencial y profunda de catálogos dinámicos
        if (this.datosbusqueda.selectedProvincia) {
          // Cargamos cantones SIN resetear para no borrar el Id recuperado
          await this.obtenerCantones(this.datosbusqueda.selectedProvincia, true);

        }


        // Re-validar cédula si existe
        if (this.usuarioGeneral.ci) {
          this.validarCedula();
        }

        this.cdr.markForCheck();
      } catch (e) {
        console.error('Error al cargar borrador:', e);
      }
    }
  }

  borrarBorrador() {
    localStorage.removeItem('user_creation_draft');
  }

  // Función para obtener los roles
  async obtenerRoles() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('rol'));
      this.datosrecuperados.roles = data || [];
      if (this.datosrecuperados.roles.length === 0) {
        this.showToast('No se encontraron roles activos en el sistema');
      }
    } catch (error) {
      console.error('Error al obtener roles:', error);
      this.showToast(ErrorHandlerUtil.getErrorMessage(error));
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Función para validar la identificación (Universal: Cédula Ecuador, Pasaporte o Documento Extranjero)
  validarCedula() {
    const identification = this.usuarioGeneral.ci;

    if (!identification) {
      this.mensajeValidacionCedula = '';
      this.cedulaValidada = false;
      this.cdr.markForCheck();
      return;
    }

    const length = identification.length;

    // Permitimos cualquier documento entre 5 y 20 caracteres para soportar pasaportes extranjeros
    if (length >= 5 && length <= 20) {
      this.mensajeValidacionCedula = 'Documento de identidad aceptado';
      this.cedulaValidada = true;
    } else {
      this.mensajeValidacionCedula = 'El documento debe tener entre 5 y 20 caracteres';
      this.cedulaValidada = false;
    }

    this.cdr.markForCheck();
  }

  // Verificar si la cédula ya existe en la base de datos
  verificarCedulaExistente(cedula: string) {
    // NOTE: Backend request required for Duplicate Check or Client-side list check
    // Logic removed for now to prevent blockages. Backend create call should validation uniqueness.
  }

  // Confirmar nombres
  confirmarNombres() {
    if (this.usuarioGeneral.primerNombre && this.usuarioGeneral.primerApellido) {
      this.nombresEdited = true;
      this.camposNombreReadonly = true;
      this.showSuccessToast('Nombres confirmados correctamente');
    } else {
      this.showToast('Por favor ingrese al menos el primer nombre y primer apellido');
    }
  }

  // Función para validar el correo electrónico
  validateEmail(email: string): boolean {
    // Primero validar formato básico del email con dominios comunes
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|mil|biz|info|io|me|tv|co|us|uk|ca|de|jp|fr|au|ru|ch|it|nl|se|no|es|mx)$/i;
    if (!basicEmailRegex.test(email)) {
      this.showToast('Por favor, ingrese un correo electrónico válido con un dominio conocido (.com, .net, .org, etc.)');
      return false;
    }

    // Validar que use un proveedor de correo conocido
    const knownProviderRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail|yahoo|icloud|aol|protonmail|zoho|mail|gmx|yandex|live|msn|inbox)\.(com|net|org)$/i;
    if (!knownProviderRegex.test(email)) {
      this.showToast('Por favor, utilice un proveedor de correo conocido como Gmail, Outlook, Hotmail, Yahoo, etc.');
      return false;
    }

    return true;
  }

  // Concatenar nombre completo
  concatenarNombreCompleto(): string {
    // Prepare full name correctly without "null" strings
    this.usuarioGeneral.nombre = [
      this.usuarioGeneral.primerNombre,
      this.usuarioGeneral.segundoNombre,
      this.usuarioGeneral.primerApellido,
      this.usuarioGeneral.segundoApellido
    ].filter(val => val && val.toString().trim() !== '' && val !== 'null').join(' ');
    return this.usuarioGeneral.nombre;
  }

  // Manejar cambio en tipo de participante
  onTipoParticipanteChange() {
    console.log('Tipo participante cambiado a:', this.usuarioGeneral.tipoParticipante);
  }

  // Obtener tipos de participante
  async obtenerTiposParticipante() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('tipos-participante'));
      this.datosrecuperados.tiposParticipante = data || [];
    } catch (err) {
      console.error('Error al obtener tipos de participante:', err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Toast para mensajes de error
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  // Toast para mensajes de éxito
  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'success',
      buttons: [
        {
          icon: 'checkmark',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  // Mostrar loader
  async showLoading(message: string) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'circles',
    });
    await loading.present();
    return loading;
  }

  // Validar formulario completo
  validateForm(): boolean {
    if (this.passoActual === 5 && !this.infoVeridica) {
      this.showToast('Por favor, confirme que la información ingresada es verídica.');
      return false;
    }

    // Validar datos básicos
    if (!this.usuarioGeneral.ci || !this.cedulaValidada) {
      this.showToast('Por favor ingrese y valide su cédula de identidad');
      return false;
    }

    if (!this.usuarioGeneral.email) {
      this.showToast('Por favor ingrese un correo electrónico');
      return false;
    }

    if (!this.validateEmail(this.usuarioGeneral.email)) {
      return false;
    }

    if (!this.usuarioGeneral.password) {
      this.showToast('Por favor ingrese una contraseña');
      return false;
    }

    if (this.usuarioGeneral.password.length < 6) {
      this.showToast('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!this.usuarioGeneral.celular) {
      this.showToast('Por favor ingrese un número de teléfono celular');
      return false;
    }

    if (!this.usuarioGeneral.primerNombre || !this.usuarioGeneral.primerApellido) {
      this.showToast('Por favor ingrese al menos el primer nombre y primer apellido');
      return false;
    }

    if (!this.usuarioGeneral.generoId) {
      this.showToast('Por favor seleccione el género');
      return false;
    }

    if (!this.usuarioGeneral.etniaId) {
      this.showToast('Por favor seleccione la autodefinición étnica');
      return false;
    }

    if (!this.usuarioGeneral.nacionalidadId) {
      this.showToast('Por favor seleccione la nacionalidad');
      return false;
    }

    if (!this.usuarioGeneral.fechaNacimiento) {
      this.showToast('Por favor ingrese la fecha de nacimiento');
      return false;
    }

    if (!this.datosbusqueda.selectedProvincia) {
      this.showToast('Por favor seleccione una provincia');
      return false;
    }

    if (!this.usuarioGeneral.cantonId && this.datosrecuperados.cantones.length > 0) {
      this.showToast('Por favor seleccione un cantón');
      return false;
    }

    // Validar rol
    if (!this.usuarioGeneral.rolId) {
      this.showToast('Por favor seleccione un rol para el usuario');
      return false;
    }

    // Validar según tipo de participante
    if (this.usuarioGeneral.tipoParticipante == this.resolvedIds.tipoAutoridad) {
      if (!this.autoridad.cargo) {
        this.showToast('Por favor seleccione el cargo de la autoridad');
        return false;
      }
      if (!this.autoridad.nivelGobierno) {
        this.showToast('Por favor seleccione el nivel de gobierno');
        return false;
      }
      if (!this.autoridad.gadAutoridad) {
        this.showToast('Por favor seleccione el GAD');
        return false;
      }
    } else if (this.usuarioGeneral.tipoParticipante == this.resolvedIds.tipoFuncionario) {
      if (!this.funcionarioGad.cargo) {
        this.showToast('Por favor seleccione el cargo del funcionario');
        return false;
      }
      if (!this.funcionarioGad.nivelGobierno) {
        this.showToast('Por favor seleccione el nivel de gobierno');
        return false;
      }
      if (!this.funcionarioGad.competencias) {
        this.showToast('Por favor seleccione las competencias');
        return false;
      }
      if (!this.funcionarioGad.gadFuncionarioGad) {
        this.showToast('Por favor seleccione el GAD');
        return false;
      }
    } else if (this.usuarioGeneral.tipoParticipante == this.resolvedIds.tipoInstitucion) {
      if (!this.institucion.institucionNivelGobiernoId) {
        this.showToast('Por favor seleccione el nivel o categoría de la institución');
        return false;
      }
      if (!this.institucion.institucion) {
        this.showToast('Por favor seleccione la institución específica');
        return false;
      }
      if (!this.institucion.gradoOcupacional) {
        this.showToast('Por favor seleccione el grado ocupacional');
        return false;
      }
      if (!this.institucion.cargo) {
        this.showToast('Por favor seleccione el cargo');
        return false;
      }
    }

    return true;
  }

  // Crear usuario
  async crearUsuario() {
    // Validar el formulario
    if (!this.validateForm()) {
      return;
    }

    const loading = await this.showLoading('Creando usuario...');

    this.usuarioGeneral.nombre = this.concatenarNombreCompleto();

    // Prepare full payload
    const fullUserData = {
      ...this.usuarioGeneral,
      tipoParticipanteId: Number(this.usuarioGeneral.tipoParticipante),
      provinciaId: Number(this.datosbusqueda.selectedProvincia),
      cantonId: this.usuarioGeneral.cantonId ? Number(this.usuarioGeneral.cantonId) : undefined,
      parroquiaId: undefined,
      gadParroquiaId: this.usuarioGeneral.gadParroquiaId ? Number(this.usuarioGeneral.gadParroquiaId) : undefined,
      generoId: this.usuarioGeneral.generoId ? Number(this.usuarioGeneral.generoId) : undefined,
      etniaId: this.usuarioGeneral.etniaId ? Number(this.usuarioGeneral.etniaId) : undefined,
      nacionalidadId: this.usuarioGeneral.nacionalidadId ? Number(this.usuarioGeneral.nacionalidadId) : undefined,
      rolId: this.usuarioGeneral.rolId ? Number(this.usuarioGeneral.rolId) : undefined,
      autoridad: this.usuarioGeneral.tipoParticipante == this.resolvedIds.tipoAutoridad ? {
        ...this.autoridad,
        nivelGobierno: this.autoridad.nivelGobierno ? String(this.autoridad.nivelGobierno) : undefined,
        parroquiaId: undefined
      } : undefined,
      funcionarioGad: this.usuarioGeneral.tipoParticipante == this.resolvedIds.tipoFuncionario ? {
        ...this.funcionarioGad,
        nivelGobierno: this.funcionarioGad.nivelGobierno ? String(this.funcionarioGad.nivelGobierno) : undefined,
        parroquiaId: undefined
      } : undefined,
      institucion: this.usuarioGeneral.tipoParticipante == this.resolvedIds.tipoInstitucion ? {
        ...this.institucion,
        institucion: (() => {
          const raw = this.institucion.institucion;
          if (raw == null || raw === '') return undefined;
          if (typeof raw === 'string' && (raw.startsWith('e:') || raw.startsWith('i:'))) return raw;
          return `i:${Number(raw)}`;
        })(),
        gradoOcupacional: this.institucion.gradoOcupacional ? Number(this.institucion.gradoOcupacional) : undefined
      } : undefined
    };

    console.log('Sending user data:', fullUserData);

    try {
      await firstValueFrom(this.usuarioService.createUsuario(fullUserData));
      await loading.dismiss();
      this.isLoading = false;
      this.borrarBorrador();
      this.cdr.markForCheck();

      const alert = await this.alertController.create({
        header: 'Usuario creado',
        message: 'El usuario ha sido creado correctamente en el sistema.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.limpiarFormulario();
              this.router.navigate(['/gestionar-usuarios']);
            }
          }
        ]
      });
      await alert.present();
    } catch (error: any) {
      await loading.dismiss();
      this.isLoading = false;
      console.error('Error al crear usuario:', error);
      this.showToast(ErrorHandlerUtil.getErrorMessage(error));
      this.cdr.markForCheck();
    }
  }

  // Limpiar formulario
  limpiarFormulario() {
    this.usuarioGeneral = {
      email: '',
      password: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      rolId: undefined,
      nombre: '',
      ci: '',
      fechaRegistro: new Date(),
      estado: 1,
      authUid: '',
      entidadId: undefined,
      firmaUrl: '',
      celular: '',
      generoId: undefined,
      etniaId: undefined,
      nacionalidadId: undefined,
      tipoParticipante: undefined,
      fechaNacimiento: '',
      cantonId: undefined,
      gadParroquiaId: undefined,
    };

    this.autoridad = {
      cargo: '',
      nivelGobierno: undefined,
      gadAutoridad: '',
      idUsuario: '',
    };

    this.funcionarioGad = {
      cargo: '',
      competencias: [],
      nivelGobierno: undefined,
      gadFuncionarioGad: '',
      idUsuario: ''
    };

    this.institucion = {
      institucion: undefined,
      institucionNivelGobiernoId: undefined,
      gradoOcupacional: undefined,
      cargo: '',
      idUsuario: ''
    };

    this.cedulaValidada = false;
    this.nombresEdited = false;
    this.camposNombreReadonly = false;
    this.mensajeValidacionCedula = '';
    this.passoActual = 1;
  }

  // Obtener cargos
  async obtenerCargos() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cargos'));
      this.datosrecuperados.cargos = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  rebuildOpcionesInstitucionCombinadas() {
    const sys = (this.datosrecuperados.instituciones || []).map((i: any) => ({
      value: `i:${i.id}`,
      label: i.nombre
    }));
    const eb = (this.datosrecuperados.educacionBasica || []).map((e: any) => ({
      value: `e:${e.id}`,
      label: e.nombre
    }));
    this.opcionesInstitucionCombinadas = [...sys, ...eb].sort((a, b) =>
      a.label.localeCompare(b.label, 'es')
    );
    this.cdr.markForCheck();
  }

  // Obtener instituciones
  async obtenerInstituciones() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/instituciones'));
      this.datosrecuperados.instituciones = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.rebuildOpcionesInstitucionCombinadas();
    }
  }

  async obtenerEducacionBasica() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/educacion-basica'));
      this.datosrecuperados.educacionBasica = data || [];
    } catch (err) {
      console.error('Error al obtener educación básica:', err);
    } finally {
      this.rebuildOpcionesInstitucionCombinadas();
    }
  }

  // Obtener grados ocupacionales
  async obtenerGradosOcupacionales() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/grados-ocupacionales'));
      this.datosrecuperados.gradosOcupacionales = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerGadParroquias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/gad-parroquias'));
      this.datosrecuperados.gadParroquias = data || [];
    } catch (err) {
      console.error('Error al obtener parroquias GAD:', err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Obtener provincias
  async obtenerProvincias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('provincias'));
      this.datosrecuperados.provincias = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Obtener cantones por provincia
  async obtenerCantones(provinciaId: any, skipReset: boolean = false) {
    if (!provinciaId) {
      this.datosrecuperados.cantones = [];
      return;
    }

    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cantones'));
      const filtered = data.filter((c: any) => Number(c.provinciaId) === Number(provinciaId));
      this.datosrecuperados.cantones = filtered;

      // Solo reseteamos si es un cambio manual del usuario (no restauración de borrador)
      if (!skipReset) {
        // Solo resetear si el cantón actual ya no pertenece a la nueva provincia
        const stillValid = this.usuarioGeneral.cantonId &&
          filtered.some((c: any) => Number(c.id) === Number(this.usuarioGeneral.cantonId));

        if (!stillValid) {
          this.datosrecuperados.parroquiasSeleccionadas = [];
          this.usuarioGeneral.gadParroquiaId = undefined;
          this.usuarioGeneral.cantonId = undefined;
        }
      }
    } catch (err) {
      console.error('Error al obtener cantones:', err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Obtener parroquias por cantón
  async obtenerParroquias(cantonId: any, skipReset: boolean = false) {
    // Actualmente la selección de parroquia se hace con `gadParroquiaId`
    // (catálogo `gad_parroquias`) y NO depende del cantón.
    // Este método se mantiene solo por compatibilidad con el asistente.
    this.datosrecuperados.parroquiasSeleccionadas = [];
    if (!skipReset) {
      // No reseteamos `gadParroquiaId` porque no existe relación cantón->parroquia en este catálogo.
    }
  }

  // Obtener generos
  async obtenerGeneros() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('generos'));
      this.datosrecuperados.generos = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Obtener etnias
  async obtenerEtnias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('etnias'));
      this.datosrecuperados.etnias = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Obtener entidades
  async obtenerEntidades() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/entidades'));
      const preferredOrder = [
        'PROVINCIAL',
        'MUNICIPAL',
        'PARROQUIAL RURAL',
        'GREMIOS',
        'GOBIERNO CENTRAL',
        'OTRAS INSTITUCIONES DEL ESTADO',
        'COOPERANTES',
        'ACADEMIA',
        'EDUCACIÓN GENERAL BÁSICA Y BACHILLERATO',
        'CIUDADANÍA',
        'MANCOMUNIDADES Y CONSORCIOS',
        'RÉGIMEN ESPECIAL'
      ];
      this.datosrecuperados.entidades = (data || []).sort((a: any, b: any) => {
        const indexA = preferredOrder.indexOf(a.nombre_entidad || a.nombre);
        const indexB = preferredOrder.indexOf(b.nombre_entidad || b.nombre);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return (a.nombre_entidad || a.nombre || '').localeCompare(b.nombre_entidad || b.nombre || '');
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerRegimenesEspeciales() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/regimenes-especiales'));
      this.datosrecuperados.regimenesEspeciales = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Obtener mancomunidades
  async obtenerMancomunidades() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/mancomunidades'));
      this.datosrecuperados.mancomunidades = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Obtener competencias
  async obtenerCompetencias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/competencias'));
      this.datosrecuperados.competencias = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Obtener nacionalidades
  async obtenerNacionalidades() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('nacionalidades'));
      this.datosrecuperados.nacionalidades = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Manejar cambio en nivel de gobierno
  onNivelGobiernoChange(nivelGobierno: string) {
    console.log('Nivel de gobierno seleccionado:', nivelGobierno);
  }

  // Obtener nombre de la entidad por ID
  getNombreEntidad(id: any): string {
    if (!id) return '';
    const ent = this.datosrecuperados.entidades.find(e => Number(e.id) === Number(id));
    return ent ? ent.nombre : '';
  }

  // Filtrar instituciones por nivel de gobierno
  getInstitucionesPorNivel(nivelId: any): any[] {
    if (!nivelId) return [];

    const entidadNombre = this.getNombreEntidad(nivelId);
    if (!entidadNombre) return [];

    // Si es uno de los niveles territoriales, el componente ya usa cantones/provincias directamente
    const nivelesTerritoriales = [
      this.resolvedIds.nivelProvincial,
      this.resolvedIds.nivelMunicipal,
      this.resolvedIds.nivelParroquial,
      this.resolvedIds.nivelMancomunidad
    ];
    if (nivelesTerritoriales.includes(Number(nivelId))) return [];

    // Para los demás, buscamos en el catálogo de instituciones filtrando por tipo/entidad
    // Si el catálogo tiene el campo 'tipo' o 'nombreEntidad' que coincida
    return this.datosrecuperados.instituciones.filter(i =>
      i.tipo === entidadNombre || i.entidadNombre === entidadNombre
    );
  }

  resolveStaticIds() {
    const findIdByCodigo = (list: any[], codigo: string) => {
      const match = list.find(i => i.codigo === codigo);
      return match ? match.id : undefined;
    };

    const findIdByNombre = (list: any[], nombre: string) => {
      const match = list.find(i => i.nombre === nombre);
      return match ? match.id : undefined;
    };

    // Resolver Roles (para auto-asignar tipo participante si es admin)
    this.resolvedIds.rolAdmin = findIdByCodigo(this.datosrecuperados.roles, 'ADMIN') || 1;

    // Resolver Tipos de Participante
    this.resolvedIds.tipoAutoridad = findIdByCodigo(this.datosrecuperados.tiposParticipante, 'AUTORIDAD') || TipoParticipanteEnum.AUTORIDAD;
    this.resolvedIds.tipoCiudadano = findIdByCodigo(this.datosrecuperados.tiposParticipante, 'CIUDADANO') || TipoParticipanteEnum.CIUDADANO;
    this.resolvedIds.tipoFuncionario = findIdByCodigo(this.datosrecuperados.tiposParticipante, 'FUNCIONARIO_GAD') || TipoParticipanteEnum.FUNCIONARIO_GAD;
    this.resolvedIds.tipoInstitucion = findIdByCodigo(this.datosrecuperados.tiposParticipante, 'INSTITUCION') || TipoParticipanteEnum.INSTITUCION;

    // Resolver Niveles de Gobierno (Entidades)
    this.resolvedIds.nivelProvincial = findIdByCodigo(this.datosrecuperados.entidades, 'NIVEL_PROVINCIAL') || NivelGobiernoEnum.PROVINCIAL;
    this.resolvedIds.nivelMunicipal = findIdByCodigo(this.datosrecuperados.entidades, 'NIVEL_MUNICIPAL') || NivelGobiernoEnum.MUNICIPAL;
    this.resolvedIds.nivelParroquial = findIdByCodigo(this.datosrecuperados.entidades, 'NIVEL_PARROQUIAL') || NivelGobiernoEnum.PARROQUIAL;
    this.resolvedIds.nivelMancomunidad = findIdByCodigo(this.datosrecuperados.entidades, 'MANCOMUNIDADES') || NivelGobiernoEnum.MANCOMUNIDADES;
    this.resolvedIds.nivelRegimenEspecial = findIdByCodigo(this.datosrecuperados.entidades, 'REGIMEN_ESPECIAL') || NivelGobiernoEnum.REGIMEN_ESPECIAL;

    console.log('[ADMIN_CREAR_DEBUG] IDs Dinámicos Resueltos:', this.resolvedIds);
  }

  getGadsParaNivel(nivel: any) {
    const n = Number(nivel);
    if (n === this.resolvedIds.nivelMancomunidad) {
      return this.datosrecuperados.mancomunidades;
    } else if (n === this.resolvedIds.nivelRegimenEspecial) {
      return this.datosrecuperados.regimenesEspeciales;
    } else if (n === this.resolvedIds.nivelMunicipal) {
      return this.getOpcionesMunicipioCombinadas();
    } else if (n === this.resolvedIds.nivelParroquial) {
      return this.datosrecuperados.gadParroquias;
    } else {
      // PROVINCIAL or others
      return this.datosrecuperados.provincias;
    }
  }

  onRolChange() {
    // Si elige Admin, forzamos TipoParticipante Autoridad (ID dinámico) para fines prácticos
    if (this.usuarioGeneral.rolId === this.resolvedIds.rolAdmin) {
      this.usuarioGeneral.tipoParticipante = this.resolvedIds.tipoAutoridad;
    }
  }

  recuperarCompetencias() { }
  recuperarMacrocumunidades() { }
  generacionMunicipios() { }
  generacionParroquias() { }
}
