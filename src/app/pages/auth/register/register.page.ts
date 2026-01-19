import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { AuthResponse } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {

  // Add the missing property for validation message
  mensajeValidacionCedula: string = '';

  usuarioGeneral = {
    //Datos para la validacion de supabase
    email:'',
    password:'',
    passwordConfirm:'',
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
    Entidad_Usuario:'',//En caso de no ser creada por el admin , estos tendran un valor en blanco
    Firma_Usuario:'',//En caso de no ser creada por el admin , estos tendran un valor en blanco
    celular: '',
    convencional: '',
    Genero: '',
    Etnia: '',
    Nacionalidad: '',
    tipoParticipante: 0,
    fechaNacimiento: '',
    canton_reside:'',
    parroquia_reside:'',
  };

  autoridad = {
    cargo:'',
    nivelgobierno:'',
    gadAutoridad:'',
    idUsuario:'',
  };

  funcionarioGad = {
    cargo:'',
    competencias:'',
    nivelgobierno:'',
    gadFuncionarioGad:'',
    idUsuario:''
  };

  institucion = {
    institucion:'',
    gradoOcupacional:'',
    cargo:'',
    idUsuario:''
  };


  datosrecuperados={
    cargos:[] as any[],
    instituciones:[] as any[],
    provincias:[] as any[],
    cantones:[] as any[],
    parroquias:[] as any[],
    parroquiasSeleccionadas:[] as any[],
    macrocomunidades:[] as any[],
    municipios:[] as any[],
    competencias:[] as any[],
  }

  datosconcatenar={
    provinciasConCantones:[] as any[],
  }

  datosbusqueda={
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
    private alertController: AlertController
  ) {}

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

      // Registrar usuario en Supabase Auth
      const response = await supabase.auth.signUp({
        email: this.usuarioGeneral.email,
        password: this.usuarioGeneral.password,
        options: {
          // Adding user metadata for easier identification
          data: {
            nombre: this.usuarioGeneral.Nombre,
            ci: this.usuarioGeneral.CI,
            rol: this.usuarioGeneral.Rol_Usuario
          }
        }
      });

      const { data, error } = response;
      const { user, session } = data || {};

      if (error) {
        await loading.dismiss();
        this.isLoading = false;

        if (error.message.includes('already registered')) {
          this.showToast('Este correo electrónico ya está registrado');
        } else {
          this.showToast('Error al registrar el usuario: ' + error.message);
        }
        return;
      }

      const UID = user?.id;

      if (!UID) {
        await loading.dismiss();
        this.isLoading = false;
        this.showToast('No se pudo obtener el ID de usuario');
        return;
      }

      // Insertar datos en la tabla Usuario
      const { data: userData, error: insertError } = await supabase
        .from('Usuario')
        .insert([
          {
            Rol_Usuario: this.usuarioGeneral.Rol_Usuario,
            Nombre_Usuario: this.usuarioGeneral.Nombre,
            CI_Usuario: this.usuarioGeneral.CI,
            Fecha_Registro: this.usuarioGeneral.Fecha_Registro,
            Estado_Usuario: this.usuarioGeneral.Estado,
            auth_uid: UID,
            Celular_Usuario: this.usuarioGeneral.celular,
            Convencional_Usuario: this.usuarioGeneral.convencional,
            Genero_Usuario: this.usuarioGeneral.Genero,
            Etnia_Usuario: this.usuarioGeneral.Etnia,
            Nacionalidad_Usuario: this.usuarioGeneral.Nacionalidad,
            Tipo_Participante: this.usuarioGeneral.tipoParticipante,
            Fecha_Nacimiento_Usuario: this.usuarioGeneral.fechaNacimiento,
            Canton_Reside_Usuario: this.usuarioGeneral.canton_reside,
            Parroquia_Reside_Usuario: this.usuarioGeneral.parroquia_reside,
          },
        ])
        .select();

      if (insertError) {
        console.error('Error detallado al insertar usuario:', insertError);
        await loading.dismiss();
        this.isLoading = false;
        this.showToast('Error al guardar los datos del usuario: ' + insertError.message);
        return;
      }

      console.log('Usuario insertado correctamente:', userData);

      // Procesar según el tipo de participante
      let secondaryInsertError = null;

      if (this.usuarioGeneral.tipoParticipante == 1) {
        const result = await this.creacionAutoridad(UID);
        secondaryInsertError = result.error;
      } else if (this.usuarioGeneral.tipoParticipante == 2) {
        const result = await this.creacionFuncionarioGad(UID);
        secondaryInsertError = result.error;
      } else if (this.usuarioGeneral.tipoParticipante == 3) {
        const result = await this.creacionInstitucion(UID);
        secondaryInsertError = result.error;
      }

      if (secondaryInsertError) {
        console.error('Error detallado en inserción secundaria:', secondaryInsertError);
        await loading.dismiss();
        this.isLoading = false;
        this.showToast('Error al guardar la información adicional: ' + secondaryInsertError.message);
        return;
      }

      // Si todo salió bien, iniciar sesión
      const loginResponse = await this.logeo();

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
      this.showToast('Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo más tarde.');
    }
  }

  async creacionAutoridad(UID: string) {
    try {
      return await supabase
        .from('Autoridades')
        .insert([
          {
            Cargo: this.autoridad.cargo,
            Nivel_Gobierno: this.autoridad.nivelgobierno,
            GAD: this.autoridad.gadAutoridad,
            Uid_Usuario: UID,
          },
        ]);
    } catch (error) {
      console.error("Error inesperado al crear la autoridad:", error);
      return { error: { message: 'Error al crear la autoridad' } };
    }
  }

  async creacionFuncionarioGad(UID: string) {
    try {
      return await supabase
        .from('FuncionarioGAD')
        .insert([
          {
            Cargo: this.funcionarioGad.cargo,
            Competencias: this.funcionarioGad.competencias,
            Nivel_Gobierno: this.funcionarioGad.nivelgobierno,
            GAD: this.funcionarioGad.gadFuncionarioGad,
            Uid_Usuario: UID,
          },
        ]);
    } catch (error) {
      console.error("Error inesperado al crear el funcionario GAD:", error);
      return { error: { message: 'Error al crear el funcionario GAD' } };
    }
  }

  async creacionInstitucion(UID: string) {
    try {
      return await supabase
        .from('Instituciones_usuario')
        .insert([
          {
            Institucion: this.institucion.institucion,
            GradoOcupacional: this.institucion.gradoOcupacional,
            Cargo: this.institucion.cargo,
            Uid_Usuario: UID,
          },
        ]);
    } catch (error) {
      console.error("Error inesperado al crear la institución:", error);
      return { error: { message: 'Error al crear la institución' } };
    }
  }

  async logeo() {
    try {
      const loginResponse = await supabase.auth.signInWithPassword({
        email: this.usuarioGeneral.email,
        password: this.usuarioGeneral.password,
      });

      const { data: loginData, error: loginError } = loginResponse;

      if (loginError) {
        console.error('Error al iniciar sesión después del registro:', loginError.message);
        this.showToast('Registro exitoso pero no se pudo iniciar sesión automáticamente. Por favor, inicie sesión manualmente.');
        return loginResponse;
      } else {
        console.log('Usuario autenticado correctamente', loginData);
        return loginResponse;
      }
    } catch (error) {
      console.error('Error en el proceso de inicio de sesión:', error);
      return { data: null, error: { message: 'Error al iniciar sesión' } };
    }
  }

  async obtenerCargos() {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .select('*');

      if (error) {
        console.error('Error al obtener cargos:', error.message);
        return;
      }

      this.datosrecuperados.cargos = data || [];
    } catch (error) {
      console.error('Error inesperado al obtener cargos:', error);
    }
  }

  async obtenerInstituciones() {
    try {
      const { data, error } = await supabase
        .from('instituciones_sistema')
        .select('*');

      if (error) {
        console.error('Error al obtener instituciones:', error.message);
        return;
      }

      this.datosrecuperados.instituciones = data || [];
    } catch (error) {
      console.error('Error inesperado al obtener instituciones:', error);
    }
  }

  async obtenerProvincias() {
    try {
      const { data, error } = await supabase
        .from('Provincias')
        .select('Codigo_Provincia,Nombre_Provincia')
        .eq('Estado', true);

      if (error) {
        console.error('Error al obtener provincias:', error.message);
        return;
      }

      this.datosrecuperados.provincias = data || [];
    } catch (error) {
      console.error('Error inesperado al obtener provincias:', error);
    }
  }

  async obtenerCantones(provinciaId: number) {
    if (!provinciaId) return;

    try {
      const { data, error } = await supabase
        .from('Cantones')
        .select('*')
        .eq('codigo_provincia', provinciaId)
        .eq('estado', true);

      if (error) {
        console.error('Error al obtener cantones:', error.message);
        return;
      }

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
      const { data, error } = await supabase
        .from('parroquia')
        .select('*')
        .eq('codigo_canton', cantonId)
        .eq('estado', true);

      if (error) {
        console.error('Error al obtener parroquias:', error.message);
        return;
      }

      this.datosrecuperados.parroquiasSeleccionadas = data || [];
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error inesperado al obtener parroquias:', error);
    }
  }

  obtenerNombreParroquia(codigoParroquia: string): string {
    if (!codigoParroquia || !this.datosrecuperados.parroquiasSeleccionadas) return 'No especificada';

    const parroquia = this.datosrecuperados.parroquiasSeleccionadas.find(
      p => p.codigo_parroquia.toString() === codigoParroquia.toString()
    );

    return parroquia ? parroquia.nombre_parroquia : 'No especificada';
  }

  async generacionMunicipios() {
    try {
      const { data: provincias, error: errorProvincias } = await supabase
        .from('Provincias')
        .select('*')
        .eq('Estado', true);

      if (errorProvincias) {
        console.error('Error al obtener provincias:', errorProvincias.message);
        return;
      }

      const { data: cantones, error: errorCantones } = await supabase
        .from('Cantones')
        .select('*')
        .eq('estado', true);

      if (errorCantones) {
        console.error('Error al obtener cantones:', errorCantones.message);
        return;
      }

      this.datosconcatenar.provinciasConCantones = provincias.map((provincia: any) => {
        const cantonesDeProvincia = cantones.filter((canton: any) => canton.codigo_provincia === provincia.Codigo_Provincia);
        return {
          ...provincia,
          cantones: cantonesDeProvincia
        };
      });

      this.datosrecuperados.municipios = this.datosconcatenar.provinciasConCantones.flatMap((provincia: any) =>
        provincia.cantones.map((canton: any) => ({
          value: `${provincia.Nombre_Provincia}/${canton.nombre_canton}`,
          idCanton: canton.codigo_canton
        }))
      );

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error inesperado al generar municipios:', error);
    }
  }

  async generacionParroquias() {
    try {
      const { data: provincias, error: errorProvincias } = await supabase
        .from('Provincias')
        .select('*')
        .eq('Estado', true);

      if (errorProvincias) {
        console.error('Error al obtener provincias:', errorProvincias.message);
        return;
      }

      const { data: cantones, error: errorCantones } = await supabase
        .from('Cantones')
        .select('*')
        .eq('estado', true);

      if (errorCantones) {
        console.error('Error al obtener cantones:', errorCantones.message);
        return;
      }

      const { data: parroquias, error: errorParroquias } = await supabase
        .from('parroquia')
        .select('*')
        .eq('estado', true);

      if (errorParroquias) {
        console.error('Error al obtener parroquias:', errorParroquias.message);
        return;
      }

      this.datosconcatenar.provinciasConCantones = provincias.map((provincia: any) => {
        const cantonesDeProvincia = cantones
          .filter((canton: any) => canton.codigo_provincia === provincia.Codigo_Provincia)
          .map((canton: any) => {
            const parroquiasDeCanton = parroquias.filter((parroquia: any) =>
              parroquia.codigo_canton === canton.codigo_canton
            );

            return {
              ...canton,
              parroquias: parroquiasDeCanton
            };
          });

        return {
          ...provincia,
          cantones: cantonesDeProvincia
        };
      });

      this.datosrecuperados.parroquias = this.datosconcatenar.provinciasConCantones.flatMap((provincia: any) =>
        provincia.cantones.flatMap((canton: any) =>
          canton.parroquias.map((parroquia: any) => ({
            value: `${provincia.Nombre_Provincia}/${canton.nombre_canton}/${parroquia.nombre_parroquia}`,
            idParroquia: parroquia.codigo_parroquia
          }))
        )
      );

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error inesperado al generar parroquias:', error);
    }
  }

  async recuperarCompetencias() {
    try {
      const { data, error } = await supabase
        .from('competencias')
        .select('*');

      if (error) {
        console.error('Error al obtener las competencias:', error.message);
        return;
      }

      this.datosrecuperados.competencias = data || [];
    } catch (error) {
      console.error('Error inesperado al recuperar competencias:', error);
    }
  }

  async recuperarMacrocumunidades() {
    try {
      const { data, error } = await supabase
        .from('mancomunidades')
        .select('*');

      if (error) {
        console.error('Error al obtener mancomunidades:', error);
        return;
      }

      this.datosrecuperados.macrocomunidades = data || [];
    } catch (error) {
      console.error('Error inesperado al recuperar mancomunidades:', error);
    }
  }

  async onNivelGobiernoChange(nivel_gobierno: string) {
    if (!nivel_gobierno) return;

    try {
      // Limpiar datos previos
      this.datosrecuperados.macrocomunidades = [];
      this.datosrecuperados.municipios = [];
      this.datosrecuperados.parroquias = [];

      if (nivel_gobierno === 'mancomunidad') {
        await this.recuperarMacrocumunidades();
      } else if (nivel_gobierno === 'municipal') {
        await this.generacionMunicipios();
      } else if (nivel_gobierno === 'otro' || nivel_gobierno === 'parroquial') {
        await this.generacionParroquias();
      } else if (nivel_gobierno === 'provincial') {
        // Ya tenemos las provincias cargadas, no hace falta hacer nada
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al cambiar nivel de gobierno:', error);
    }
  }

  iraLogin() {
    this.router.navigate(['/login']);
  }
}
