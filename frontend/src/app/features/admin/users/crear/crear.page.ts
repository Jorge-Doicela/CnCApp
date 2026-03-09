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
import { TipoParticipanteEnum } from 'src/app/shared/constants/enums';
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
  today: Date = new Date();
  showPassword: boolean = false;
  // Variable para mensajes de validación
  mensajeValidacionCedula: string = '';

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
    convencional: '',
    genero: '',
    etnia: '',
    nacionalidadId: undefined as number | undefined,
    tipoParticipante: 0, // Por defecto ciudadano
    fechaNacimiento: '',
    cantonId: undefined as number | undefined,
    parroquiaId: undefined as number | undefined,
  };

  autoridad = {
    cargo: '',
    nivelGobierno: '',
    gadAutoridad: '',
    idUsuario: '',
  };

  funcionarioGad = {
    cargo: '',
    competencias: '',
    nivelGobierno: '',
    gadFuncionarioGad: '',
    idUsuario: ''
  };

  institucion = {
    institucion: '',
    gradoOcupacional: '',
    cargo: '',
    idUsuario: ''
  };

  datosrecuperados = {
    roles: [] as any[],
    cargos: [] as any[],
    instituciones: [] as any[],
    provincias: [] as any[],
    cantones: [] as any[],
    parroquias: [] as any[],
    parroquiasSeleccionadas: [] as any[],
    macrocomunidades: [] as any[],
    municipios: [] as any[],
    competencias: [] as any[],
    gradosOcupacionales: [] as any[],
    tiposParticipante: [] as any[],
  }

  datosconcatenar = {
    provinciasConCantones: [] as any[],
  }

  datosbusqueda = {
    selectedProvincia: 0,
    selectedCanton: 0
  }

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
        if (!this.usuarioGeneral.genero || !this.usuarioGeneral.etnia) {
          this.showToast('Género y etnia son obligatorios');
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
        if (this.usuarioGeneral.tipoParticipante == TipoParticipanteEnum.AUTORIDAD) { // Autoridad
          if (!this.autoridad.cargo || !this.autoridad.nivelGobierno) {
            this.showToast('Complete los datos de autoridad');
            return false;
          }
        } else if (this.usuarioGeneral.tipoParticipante == TipoParticipanteEnum.FUNCIONARIO_GAD) { // Funcionario
          if (!this.funcionarioGad.cargo || !this.funcionarioGad.nivelGobierno) {
            this.showToast('Complete los datos de funcionario');
            return false;
          }
        } else if (this.usuarioGeneral.tipoParticipante == TipoParticipanteEnum.INSTITUCION) { // Institución
          if (!this.institucion.institucion || !this.institucion.cargo) {
            this.showToast('Complete los datos institucionales');
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

  ngOnInit() {
    this.obtenerRoles();
    this.obtenerProvincias();
    this.obtenerCargos();
    this.obtenerInstituciones();
    this.obtenerGradosOcupacionales();
    this.obtenerTiposParticipante();
    this.cargarProgreso();
  }

  // Persistencia de formulario
  guardarProgreso() {
    const data = {
      usuarioGeneral: this.usuarioGeneral,
      autoridad: this.autoridad,
      funcionarioGad: this.funcionarioGad,
      institucion: this.institucion,
      passoActual: this.passoActual,
      datosbusqueda: this.datosbusqueda
    };
    localStorage.setItem('user_creation_draft', JSON.stringify(data));
  }

  cargarProgreso() {
    const saved = localStorage.getItem('user_creation_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.usuarioGeneral = { ...this.usuarioGeneral, ...data.usuarioGeneral };
        this.autoridad = { ...this.autoridad, ...data.autoridad };
        this.funcionarioGad = { ...this.funcionarioGad, ...data.funcionarioGad };
        this.institucion = { ...this.institucion, ...data.institucion };
        this.passoActual = data.passoActual || 1;
        this.datosbusqueda = { ...this.datosbusqueda, ...data.datosbusqueda };
        
        // Re-validar cédula si existe
        if (this.usuarioGeneral.ci) {
          this.validarCedula();
        }
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

  // Función para validar la identificación (Cédula Ecuador o Documento Extranjero)
  validarCedula() {
    const identification = this.usuarioGeneral.ci;
    
    if (!identification) {
      this.mensajeValidacionCedula = '';
      this.cedulaValidada = false;
      this.cdr.markForCheck();
      return;
    }

    const isNumeric = /^\d+$/.test(identification);
    const length = identification.length;

    // Caso 1: Cédula Ecuatoriana (10 dígitos numéricos)
    if (isNumeric && length === 10) {
      const provincia = parseInt(identification.substring(0, 2), 10);
      const tercerDigito = parseInt(identification.substring(2, 3), 10);

      // Validar provincia (01-24 o 30)
      if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
        this.mensajeValidacionCedula = `Provincia inválida (${provincia})`;
        this.cedulaValidada = false;
        this.cdr.markForCheck();
        return;
      }

      // Validar tercer dígito (debe ser < 6 para personas naturales)
      if (tercerDigito >= 6) {
        this.mensajeValidacionCedula = 'El tercer dígito debe ser menor a 6';
        this.cedulaValidada = false;
        this.cdr.markForCheck();
        return;
      }

      // Algoritmo Modulo 10
      const digitoVerificador = parseInt(identification.charAt(9), 10);
      let suma = 0;
      for (let i = 0; i < 9; i++) {
        let valor = parseInt(identification.charAt(i), 10);
        if (i % 2 === 0) { // Posiciones impares (0, 2, 4, 6, 8)
          valor *= 2;
          if (valor > 9) valor -= 9;
        }
        suma += valor;
      }

      const residuo = suma % 10;
      const digitoCalculado = residuo === 0 ? 0 : 10 - residuo;

      if (digitoVerificador === digitoCalculado) {
        this.mensajeValidacionCedula = 'Cédula ecuatoriana válida';
        this.cedulaValidada = true;
      } else {
        this.mensajeValidacionCedula = 'Número de cédula inválido';
        this.cedulaValidada = false;
      }
    } 
    // Caso 2: Documento Extranjero / Pasaporte
    // Si no es numérico exacto de 10 o tiene letras, lo tratamos como extranjero
    else if (!isNumeric || (length > 5 && length !== 10)) {
      this.mensajeValidacionCedula = 'Documento extranjero/Pasaporte aceptado';
      this.cedulaValidada = true; // Lo aceptamos para no bloquear extranjeros
    } 
    // Caso 3: Incompleto o inválido
    else {
      this.mensajeValidacionCedula = 'Cédula debe tener 10 dígitos o ser pasaporte';
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
    return `${this.usuarioGeneral.primerNombre} ${this.usuarioGeneral.segundoNombre || ''} ${this.usuarioGeneral.primerApellido} ${this.usuarioGeneral.segundoApellido || ''}`.trim().replace(/\s+/g, ' ');
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

    if (!this.nombresEdited) {
      this.showToast('Por favor confirme los nombres del usuario');
      return false;
    }

    if (!this.usuarioGeneral.genero) {
      this.showToast('Por favor seleccione el género');
      return false;
    }

    if (!this.usuarioGeneral.etnia) {
      this.showToast('Por favor seleccione la autodefinición étnica');
      return false;
    }

    if (!this.usuarioGeneral.nacionalidadId) {
      this.showToast('Por favor seleccione la nacionalidad');
      return false;
    }

    if (!this.usuarioGeneral.etnia) {
      this.showToast('Por favor seleccione la autodefinición étnica');
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
    if (this.usuarioGeneral.tipoParticipante == TipoParticipanteEnum.AUTORIDAD) {
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
    } else if (this.usuarioGeneral.tipoParticipante == TipoParticipanteEnum.FUNCIONARIO_GAD) {
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
    } else if (this.usuarioGeneral.tipoParticipante == TipoParticipanteEnum.INSTITUCION) {
      if (!this.institucion.institucion) {
        this.showToast('Por favor seleccione la institución');
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
      provinciaId: this.datosbusqueda.selectedProvincia,
      autoridad: this.usuarioGeneral.tipoParticipante == TipoParticipanteEnum.AUTORIDAD ? { ...this.autoridad, parroquiaId: this.usuarioGeneral.parroquiaId } : undefined,
      funcionarioGad: this.usuarioGeneral.tipoParticipante == TipoParticipanteEnum.FUNCIONARIO_GAD ? { ...this.funcionarioGad, parroquiaId: this.usuarioGeneral.parroquiaId } : undefined,
      institucion: this.usuarioGeneral.tipoParticipante == TipoParticipanteEnum.INSTITUCION ? this.institucion : undefined
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
      convencional: '',
      genero: '',
      etnia: '',
      nacionalidadId: undefined,
      tipoParticipante: 0,
      fechaNacimiento: '',
      cantonId: undefined,
      parroquiaId: undefined,
    };

    this.autoridad = {
      cargo: '',
      nivelGobierno: '',
      gadAutoridad: '',
      idUsuario: '',
    };

    this.funcionarioGad = {
      cargo: '',
      competencias: '',
      nivelGobierno: '',
      gadFuncionarioGad: '',
      idUsuario: ''
    };

    this.institucion = {
      institucion: '',
      gradoOcupacional: '',
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

  // Obtener instituciones
  async obtenerInstituciones() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/instituciones'));
      this.datosrecuperados.instituciones = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
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
  async obtenerCantones(provinciaId: any) {
    if (!provinciaId) return;
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cantones'));
      this.datosrecuperados.cantones = data.filter((c: any) => c.provinciaId == provinciaId);
      this.datosrecuperados.parroquiasSeleccionadas = [];
      this.usuarioGeneral.parroquiaId = undefined;
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Obtener parroquias por cantón
  async obtenerParroquias(cantonId: any) {
    if (!cantonId) return;
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('parroquias'));
      this.datosrecuperados.parroquiasSeleccionadas = data.filter((p: any) => p.cantonId == cantonId);
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Manejar cambio en nivel de gobierno
  onNivelGobiernoChange(nivelGobierno: string) {
    // Este método se llama cuando cambia el nivel de gobierno
    // Aquí puedes agregar lógica adicional si es necesario
    console.log('Nivel de gobierno seleccionado:', nivelGobierno);
  }

  recuperarCompetencias() { }
  recuperarMacrocumunidades() { }
  generacionMunicipios() { }
  generacionParroquias() { }
}
