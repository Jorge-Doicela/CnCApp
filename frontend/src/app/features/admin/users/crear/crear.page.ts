import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  shieldCheckmarkOutline, keyOutline, saveOutline, checkmarkDoneOutline, checkmarkDoneCircleOutline,
  personAddOutline, searchOutline, idCardOutline, businessOutline, shieldOutline, fingerPrintOutline,
  callOutline, peopleOutline, createOutline, trashOutline, mailOutline, lockClosedOutline,
  calendarOutline, maleFemaleOutline, globeOutline, peopleCircleOutline, briefcaseOutline,
  ribbonOutline, constructOutline, analyticsOutline, close as closeIcon, chevronBackOutline, chevronForwardOutline
} from 'ionicons/icons';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CrearPage implements OnInit {
  // Variable para mensajes de validación
  mensajeValidacionCedula: string = '';

  usuarioGeneral = {
    // Datos para la validación de supabase
    email: '',
    password: '',
    // Datos generales para todos los usuarios
    nombre1: '',
    nombre2: '',
    apellido1: '',
    apellido2: '',
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
    nacionalidad: '',
    tipoParticipante: 0, // Por defecto ciudadano
    fechaNacimiento: '',
    cantonReside: '',
    parroquiaReside: '',
  };

  autoridad = {
    cargo: '',
    nivelgobierno: '',
    gadAutoridad: '',
    idUsuario: '',
  };

  funcionarioGad = {
    cargo: '',
    competencias: '',
    nivelgobierno: '',
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
      'chevron-forward-outline': chevronForwardOutline
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
    } else if (passo === this.passoActual + 1 && this.validarPassoActual()) {
      this.passoActual = passo;
    }
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
        if (!this.usuarioGeneral.nombre1 || !this.usuarioGeneral.apellido1) {
          this.showToast('Nombre y primer apellido son obligatorios');
          return false;
        }
        if (!this.nombresEdited) {
          this.showToast('Por favor confirme los nombres');
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
        if (!this.usuarioGeneral.cantonReside && this.datosrecuperados.cantones.length > 0) {
          this.showToast('Seleccione un cantón');
          return false;
        }
        return true;

      case 4: // Datos Específicos
        if (this.usuarioGeneral.tipoParticipante == 1) { // Autoridad
          if (!this.autoridad.cargo || !this.autoridad.nivelgobierno) {
            this.showToast('Complete los datos de autoridad');
            return false;
          }
        } else if (this.usuarioGeneral.tipoParticipante == 2) { // Funcionario
          if (!this.funcionarioGad.cargo || !this.funcionarioGad.nivelgobierno) {
            this.showToast('Complete los datos de funcionario');
            return false;
          }
        } else if (this.usuarioGeneral.tipoParticipante == 3) { // Institución
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
    const c = this.datosrecuperados.cantones.find(cant => cant.id === this.usuarioGeneral.cantonReside);
    return c ? c.nombre : 'No seleccionado';
  }

  ngOnInit() {
    this.obtenerRoles();
    this.obtenerProvincias();
    this.obtenerCargos();
    this.obtenerInstituciones();
  }

  // Función para obtener los roles
  obtenerRoles() {
    this.catalogoService.getItems('rol').subscribe({
      next: (data) => {
        this.datosrecuperados.roles = data || [];
        this.cdr.detectChanges();
        if (this.datosrecuperados.roles.length === 0) {
          this.showToast('No se encontraron roles activos en el sistema');
        }
      },
      error: (error) => {
        console.error('Error al obtener roles:', error);
        this.showToast('Error al cargar roles');
      }
    });
  }

  // Función para validar la cédula ecuatoriana
  validarCedula() {
    const cedula = this.usuarioGeneral.ci;
    // Verificar longitud
    if (cedula.length !== 10) {
      this.mensajeValidacionCedula = 'La cédula debe tener 10 dígitos';
      this.showToast(this.mensajeValidacionCedula);
      this.cedulaValidada = false;
      return;
    }
    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(cedula)) {
      this.mensajeValidacionCedula = 'La cédula debe contener solo números';
      this.showToast(this.mensajeValidacionCedula);
      this.cedulaValidada = false;
      return;
    }
    // Verificar código de provincia
    const codigoProvincia = cedula.substring(0, 2);
    if (!this.provinciasCodigos[codigoProvincia]) {
      this.mensajeValidacionCedula = `Código de provincia inválido: ${codigoProvincia}`;
      this.showToast(this.mensajeValidacionCedula);
      this.cedulaValidada = false;
      return;
    }
    // Algoritmo de validación (Algoritmo 10)
    const digitoVerificador = parseInt(cedula.charAt(9), 10);
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i), 10);

      // Para los dígitos impares (posiciones pares 0,2,4,6,8)
      if (i % 2 === 0) {
        valor = valor * 2;
        if (valor > 9) {
          valor = valor - 9;
        }
      }
      suma += valor;
    }
    const digitoCalculado = 10 - (suma % 10);
    // Si el dígito calculado es 10, se convierte a 0
    const digitoEsperado = (digitoCalculado === 10) ? 0 : digitoCalculado;

    if (digitoVerificador === digitoEsperado) {
      this.mensajeValidacionCedula = 'Cédula validada correctamente';
      this.showSuccessToast(this.mensajeValidacionCedula);
      this.cedulaValidada = true;
      // Verificar si la cédula ya existe en la base de datos
      this.verificarCedulaExistente(cedula);
    } else {
      this.mensajeValidacionCedula = 'La cédula ingresada no es válida';
      this.showToast(this.mensajeValidacionCedula);
      this.cedulaValidada = false;
    }
  }

  // Verificar si la cédula ya existe en la base de datos
  verificarCedulaExistente(cedula: string) {
    // NOTE: Backend request required for Duplicate Check or Client-side list check
    // Logic removed for now to prevent blockages. Backend create call should validation uniqueness.
  }

  // Confirmar nombres
  confirmarNombres() {
    if (this.usuarioGeneral.nombre1 && this.usuarioGeneral.apellido1) {
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
    return `${this.usuarioGeneral.nombre1} ${this.usuarioGeneral.nombre2 || ''} ${this.usuarioGeneral.apellido1} ${this.usuarioGeneral.apellido2 || ''}`.trim().replace(/\s+/g, ' ');
  }

  // Manejar cambio en tipo de participante
  onTipoParticipanteChange() {
    // No necesitamos cargar datos adicionales ya que lo hicimos al inicio
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

    if (!this.usuarioGeneral.nombre1 || !this.usuarioGeneral.apellido1) {
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

    if (!this.usuarioGeneral.nacionalidad) {
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

    if (!this.usuarioGeneral.cantonReside && this.datosrecuperados.cantones.length > 0) {
      this.showToast('Por favor seleccione un cantón');
      return false;
    }

    // Validar rol
    if (!this.usuarioGeneral.rolId) {
      this.showToast('Por favor seleccione un rol para el usuario');
      return false;
    }

    // Validar según tipo de participante
    if (this.usuarioGeneral.tipoParticipante == 1) {
      if (!this.autoridad.cargo) {
        this.showToast('Por favor seleccione el cargo de la autoridad');
        return false;
      }
      if (!this.autoridad.nivelgobierno) {
        this.showToast('Por favor seleccione el nivel de gobierno');
        return false;
      }
      if (!this.autoridad.gadAutoridad) {
        this.showToast('Por favor seleccione el GAD');
        return false;
      }
    } else if (this.usuarioGeneral.tipoParticipante == 2) {
      if (!this.funcionarioGad.cargo) {
        this.showToast('Por favor seleccione el cargo del funcionario');
        return false;
      }
      if (!this.funcionarioGad.nivelgobierno) {
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
    } else if (this.usuarioGeneral.tipoParticipante == 3) {
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
      autoridad: this.usuarioGeneral.tipoParticipante == 1 ? this.autoridad : undefined,
      funcionarioGad: this.usuarioGeneral.tipoParticipante == 2 ? this.funcionarioGad : undefined,
      institucion: this.usuarioGeneral.tipoParticipante == 3 ? this.institucion : undefined
    };

    console.log('Sending user data:', fullUserData);

    this.usuarioService.createUsuario(fullUserData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading = false;

        const alert = await this.alertController.create({
          header: 'Usuario creado',
          message: 'El usuario ha sido creado correctamente en el sistema.',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                this.limpiarFormulario();
                this.router.navigate(['/admin/usuarios']);
              }
            }
          ]
        });
        await alert.present();
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        console.error('Error al crear usuario:', error);
        const msg = error.error?.message || error.message || 'Error desconocido';
        this.showToast('Error al crear el usuario: ' + msg);
      }
    });
  }

  // Limpiar formulario
  limpiarFormulario() {
    this.usuarioGeneral = {
      email: '',
      password: '',
      nombre1: '',
      nombre2: '',
      apellido1: '',
      apellido2: '',
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
      nacionalidad: '',
      tipoParticipante: 0,
      fechaNacimiento: '',
      cantonReside: '',
      parroquiaReside: '',
    };

    this.autoridad = {
      cargo: '',
      nivelgobierno: '',
      gadAutoridad: '',
      idUsuario: '',
    };

    this.funcionarioGad = {
      cargo: '',
      competencias: '',
      nivelgobierno: '',
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
  obtenerCargos() {
    this.catalogoService.getItems('cargos').subscribe({
      next: (data) => this.datosrecuperados.cargos = data || [],
      error: (err) => console.error(err)
    });
  }

  // Obtener instituciones
  obtenerInstituciones() {
    this.catalogoService.getItems('instituciones_sistema').subscribe({ // Verify endpoint name
      next: (data) => this.datosrecuperados.instituciones = data || [],
      error: (err) => console.error(err)
    });
  }

  // Obtener provincias
  obtenerProvincias() {
    this.catalogoService.getItems('provincias').subscribe({
      next: (data) => this.datosrecuperados.provincias = data || [],
      error: (err) => console.error(err)
    });
  }

  // Obtener cantones por provincia
  obtenerCantones(provinciaId: number) {
    if (!provinciaId) return;
    this.catalogoService.getItems('cantones').subscribe({
      next: (data) => {
        this.datosrecuperados.cantones = data.filter((c: any) => c.provinciaId == provinciaId);
        this.datosrecuperados.parroquiasSeleccionadas = [];
        this.usuarioGeneral.parroquiaReside = '';
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // Obtener parroquias por cantón
  obtenerParroquias(cantonId: string) {
    if (!cantonId) return;
    this.catalogoService.getItems('parroquias').subscribe({
      next: (data) => {
        this.datosrecuperados.parroquiasSeleccionadas = data.filter((p: any) => p.cantonId == cantonId);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
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
