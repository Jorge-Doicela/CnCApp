import { IonicModule } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class RegisterPage implements OnInit {

  // Add the missing property for validation message
  mensajeValidacionCedula: string = '';

  usuarioGeneral = {
    //Datos para la validacion de supabase
    email: '',
    password: '',
    passwordConfirm: '',
    //Datos generales para todos los usuarios
    Nombre1: '',
    Nombre2: '',
    Apellido1: '',
    Apellido2: '',
    Rol_Usuario: 1,
    Nombre: '',
    CI: '',
    Fecha_Registro: new Date(),
    Estado: 1, // 1 = Activo
    auth_uid: '',
    Entidad_Usuario: '',//En caso de no ser creada por el admin , estos tendran un valor en blanco
    Firma_Usuario: '',//En caso de no ser creada por el admin , estos tendran un valor en blanco
    celular: '',
    convencional: '',
    Genero: '',
    Etnia: '',
    Nacionalidad: '',
    tipoParticipante: 0,
    fechaNacimiento: '',
    canton_reside: '',
    parroquia_reside: '',
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
  currentStep: number = 1;
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

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.obtenerProvincias();
  }

  // Función para validar la cédula ecuatoriana
  validarCedula() {
    const cedula = this.usuarioGeneral.CI;

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

      // Permitir que el usuario llene los campos de nombre y apellido
      this.camposNombreReadonly = false;
    } else {
      this.mensajeValidacionCedula = 'La cédula ingresada no es válida';
      this.showToast(this.mensajeValidacionCedula);
      this.cedulaValidada = false;
    }
  }

  // Add the missing method for confirming names
  confirmarNombres() {
    if (this.usuarioGeneral.Nombre1 && this.usuarioGeneral.Apellido1) {
      this.nombresEdited = true;
      this.camposNombreReadonly = true;
      this.showSuccessToast('Nombres confirmados correctamente');
    } else {
      this.showToast('Por favor ingrese al menos el primer nombre y primer apellido');
    }
  }

  // Verificación adicional para el paso 2
  validateStep2(): boolean {
    if (!this.cedulaValidada) {
      this.showToast('Por favor valide su cédula antes de continuar');
      return false;
    }

    return true;
  }

  // Función para bloquear campos de nombre después de validación
  bloquearCamposNombre() {
    if (this.usuarioGeneral.Nombre1 && this.usuarioGeneral.Apellido1) {
      this.camposNombreReadonly = true;
    }
  }

  nextStep() {
    // Validar el formulario actual antes de avanzar
    if (this.validateCurrentStep()) {
      // Validación adicional para el paso 2
      if (this.currentStep === 2) {
        if (!this.validateStep2()) {
          return;
        }
      }

      // Si estamos en el paso 3 y se han llenado los nombres, los bloqueamos
      if (this.currentStep === 3) {
        this.bloquearCamposNombre();
      }

      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  prevStep() {
    this.currentStep--;
    window.scrollTo(0, 0);
  }

  validateCurrentStep(): boolean {
    this.formErrors = {};

    switch (this.currentStep) {
      case 1:
        // El paso 1 es informativo, no hay validación
        return true;

      case 2:
        // Validación del paso 2: Información de contacto
        if (!this.usuarioGeneral.CI) {
          this.showToast('Por favor ingrese su número de cédula');
          return false;
        }
        if (!this.usuarioGeneral.email) {
          this.showToast('Por favor ingrese su correo electrónico');
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
        if (this.usuarioGeneral.password !== this.usuarioGeneral.passwordConfirm) {
          this.showToast('Las contraseñas no coinciden');
          return false;
        }
        if (!this.usuarioGeneral.celular) {
          this.showToast('Por favor ingrese su número de teléfono celular');
          return false;
        }
        if (!this.datosbusqueda.selectedProvincia) {
          this.showToast('Por favor seleccione una provincia');
          return false;
        }
        if (!this.usuarioGeneral.canton_reside && this.datosrecuperados.cantones.length > 0) {
          this.showToast('Por favor seleccione un cantón');
          return false;
        }
        return true;

      case 3:
        // Validación del paso 3: Información personal
        if (!this.usuarioGeneral.Nombre1) {
          this.showToast('Por favor ingrese su primer nombre');
          return false;
        }
        if (!this.usuarioGeneral.Apellido1) {
          this.showToast('Por favor ingrese su primer apellido');
          return false;
        }
        if (!this.usuarioGeneral.Genero) {
          this.showToast('Por favor seleccione su género');
          return false;
        }
        if (!this.usuarioGeneral.Nacionalidad) {
          this.showToast('Por favor seleccione su nacionalidad');
          return false;
        }
        if (!this.usuarioGeneral.Etnia) {
          this.showToast('Por favor seleccione su autodefinición étnica');
          return false;
        }
        if (!this.usuarioGeneral.fechaNacimiento) {
          this.showToast('Por favor ingrese su fecha de nacimiento');
          return false;
        }
        return true;

      case 4:
        // Validación del paso 4: Perfil profesional
        if (this.usuarioGeneral.tipoParticipante == 1) {
          // Validación para autoridad
          if (!this.autoridad.cargo) {
            this.showToast('Por favor seleccione su cargo como autoridad');
            return false;
          }
          if (!this.autoridad.nivelgobierno) {
            this.showToast('Por favor seleccione el nivel de gobierno');
            return false;
          }
          if (!this.autoridad.gadAutoridad) {
            this.showToast('Por favor seleccione su GAD');
            return false;
          }
        } else if (this.usuarioGeneral.tipoParticipante == 2) {
          // Validación para funcionario GAD
          if (!this.funcionarioGad.cargo) {
            this.showToast('Por favor seleccione su cargo');
            return false;
          }
          if (!this.funcionarioGad.nivelgobierno) {
            this.showToast('Por favor seleccione el nivel de gobierno');
            return false;
          }
          if (!this.funcionarioGad.competencias) {
            this.showToast('Por favor seleccione sus competencias');
            return false;
          }
          if (!this.funcionarioGad.gadFuncionarioGad) {
            this.showToast('Por favor seleccione su GAD');
            return false;
          }
        } else if (this.usuarioGeneral.tipoParticipante == 3) {
          // Validación para institución
          if (!this.institucion.institucion) {
            this.showToast('Por favor seleccione su institución');
            return false;
          }
          if (!this.institucion.gradoOcupacional) {
            this.showToast('Por favor seleccione su grado ocupacional');
            return false;
          }
          if (!this.institucion.cargo) {
            this.showToast('Por favor seleccione su cargo');
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  }

  validateEmail(email: string): boolean {
    // Primero validar formato básico del email con dominios comunes
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|mil|biz|info|io|me|tv|co|us|uk|ca|de|jp|fr|au|ru|ch|it|nl|se|no|es|mx)$/i;
    if (!basicEmailRegex.test(email)) {
      this.showToast('Por favor, ingrese un correo electrónico válido con un dominio conocido (.com, .net, .org, etc.)');
      return false;
    }

    // Luego validar que use un proveedor de correo conocido
    const knownProviderRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail|yahoo|icloud|aol|protonmail|zoho|mail|gmx|yandex|live|msn|inbox)\.(com|net|org)$/i;
    if (!knownProviderRegex.test(email)) {
      this.showToast('Por favor, utilice un proveedor de correo conocido como Gmail, Outlook, Hotmail, Yahoo, etc.');
      return false;
    }

    return true;
  }

  concatenarNombreCompleto(): string {
    return `${this.usuarioGeneral.Nombre1} ${this.usuarioGeneral.Nombre2 || ''} ${this.usuarioGeneral.Apellido1} ${this.usuarioGeneral.Apellido2 || ''}`.trim().replace(/\s+/g, ' ');
  }

  onTipoParticipanteChange() {
    if (this.usuarioGeneral.tipoParticipante == 0) {
      // Ciudadano - no se necesita acción adicional
    } else if (this.usuarioGeneral.tipoParticipante == 1) {
      // Autoridad
      this.recuperarMacrocumunidades();
      this.generacionMunicipios();
      this.generacionParroquias();
    } else if (this.usuarioGeneral.tipoParticipante == 2) {
      // Funcionario GAD
      this.recuperarCompetencias();
      this.recuperarMacrocumunidades();
      this.generacionMunicipios();
      this.generacionParroquias();
    } else if (this.usuarioGeneral.tipoParticipante == 3) {
      // Institución
      this.obtenerCargos();
      this.obtenerInstituciones();
    }
  }

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

  async showLoading(message: string) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'circles',
    });
    await loading.present();
    return loading;
  }

  async registerUser() {
    try {
      // Mostrar loader
      const loading = await this.showLoading('Procesando su registro...');

      this.usuarioGeneral.Nombre = this.concatenarNombreCompleto();

      // Construir payload completo para el backend
      const payload = {
        user: {
          email: this.usuarioGeneral.email,
          password: this.usuarioGeneral.password,
          nombre: this.usuarioGeneral.Nombre,
          ci: this.usuarioGeneral.CI,
          rol: this.usuarioGeneral.Rol_Usuario,
          celular: this.usuarioGeneral.celular,
          convencional: this.usuarioGeneral.convencional,
          genero: this.usuarioGeneral.Genero,
          etnia: this.usuarioGeneral.Etnia,
          nacionalidad: this.usuarioGeneral.Nacionalidad,
          tipoParticipante: this.usuarioGeneral.tipoParticipante,
          fechaNacimiento: this.usuarioGeneral.fechaNacimiento,
          cantonReside: this.usuarioGeneral.canton_reside,
          parroquiaReside: this.usuarioGeneral.parroquia_reside,
        },
        autoridad: this.usuarioGeneral.tipoParticipante == 1 ? this.autoridad : null,
        funcionarioGad: this.usuarioGeneral.tipoParticipante == 2 ? this.funcionarioGad : null,
        institucion: this.usuarioGeneral.tipoParticipante == 3 ? this.institucion : null
      };

      // Llamada al backend
      // await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/register`, payload));

      console.log('Simulating registration sent to backend:', payload);

      // Simular delay y éxito
      await new Promise(resolve => setTimeout(resolve, 1500));

      await loading.dismiss();
      this.isLoading = false;

      // Mostrar alerta de éxito
      const alert = await this.alertController.create({
        header: 'Registro exitoso',
        message: '¡Bienvenido al Consejo Nacional de Competencias! Su registro ha sido completado exitosamente.',
        buttons: ['OK']
      });
      await alert.present();

      // Redireccionar según el rol del usuario
      setTimeout(() => {
        if (this.usuarioGeneral.Rol_Usuario === 2) {
          window.location.href = '/admin/certificados';
        } else {
          window.location.href = '/';
        }
      }, 1500);

    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.isLoading = false;

      // Cerrar loading si existe
      const loadingElement = await this.loadingController.getTop();
      if (loadingElement) {
        await this.loadingController.dismiss();
      }

      // Mostrar mensaje de error
      this.showToast('Ha ocurrido un error inesperado: ' + (error.message || error));
    }
  }

  async obtenerCargos() {
    try {
      // Mock or fetch from backend
      // const data = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/catalogs/cargos`));
      const data: any[] = []; // Placeholder
      this.datosrecuperados.cargos = data || [];
    } catch (error) {
      console.error('Error inesperado al obtener cargos:', error);
    }
  }

  async obtenerInstituciones() {
    try {
      // Mock or fetch from backend
      // const data = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/catalogs/instituciones`));
      const data: any[] = []; // Placeholder
      this.datosrecuperados.instituciones = data || [];
    } catch (error) {
      console.error('Error inesperado al obtener instituciones:', error);
    }
  }

  async obtenerProvincias() {
    try {
      // Mock or fetch from backend
      // const data = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/catalogs/provincias`));
      const data: any[] = [];
      this.datosrecuperados.provincias = data || [];
    } catch (error) {
      console.error('Error inesperado al obtener provincias:', error);
    }
  }

  async obtenerCantones(provinciaId: number) {
    if (!provinciaId) return;

    try {
      // Mock or fetch from backend
      // const data = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/catalogs/cantones/${provinciaId}`));
      const data: any[] = [];
      this.datosrecuperados.cantones = data || [];
      // Limpiamos las parroquias al cambiar de provincia
      this.datosrecuperados.parroquiasSeleccionadas = [];
      this.usuarioGeneral.parroquia_reside = '';
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error inesperado al obtener cantones:', error);
    }
  }

  async obtenerParroquias(cantonId: string) {
    if (!cantonId) return;

    try {
      // Mock or fetch from backend
      // const data = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/catalogs/parroquias/${cantonId}`));
      const data: any[] = [];
      this.datosrecuperados.parroquiasSeleccionadas = data || [];
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error inesperado al obtener parroquias:', error);
    }
  }

  obtenerNombreParroquia(codigoParroquia: string): string {
    if (!codigoParroquia || !this.datosrecuperados.parroquiasSeleccionadas) return 'No especificada';

    const parroquia = this.datosrecuperados.parroquiasSeleccionadas.find(
      p => p.codigo_parroquia === codigoParroquia
    );

    return parroquia ? parroquia.nombre_parroquia : 'Desconocida';
  }

  // Placeholder methods for missing implementations
  recuperarMacrocumunidades() {
    // TODO: Implement fetching macrocomunidades from backend
  }

  generacionMunicipios() {
    // TODO: Implement fetching municipios from backend
  }

  generacionParroquias() {
    // TODO: Implement fetching parroquias from backend
  }

  recuperarCompetencias() {
    // TODO: Implement fetching competencias from backend
  }

  onNivelGobiernoChange(nivel_gobierno: string) {
    if (!nivel_gobierno) return;

    // Logic to handle government level change
    // This previously fetched data from Supabase
    console.log('Nivel de gobierno changed:', nivel_gobierno);

    // Clear previous data
    this.datosrecuperados.macrocomunidades = [];
    this.datosrecuperados.municipios = [];
    this.datosrecuperados.parroquias = [];

    if (nivel_gobierno === 'mancomunidad') {
      this.recuperarMacrocumunidades();
    } else if (nivel_gobierno === 'municipal') {
      this.generacionMunicipios();
    } else if (nivel_gobierno === 'otro' || nivel_gobierno === 'parroquial') {
      this.generacionParroquias();
    }
  }
}
